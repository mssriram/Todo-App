const notes = passedNotes.notes;

let grid = new Muuri('.grid', {
    dragEnabled: true,
    dragStartPredicate: {
        distance: 10,
        delay: 10,
    },
    itemDraggingClass: 'drag-class',
    itemReleasingClass: 'release-class'
})

const updateLayout = () => {
    const notesLength = grid.getItems().length;
    for (let i=0; i<notesLength; i++) {
        grid.remove([grid.getItem(0)], {removeElements: true});
    }

    axios.get('/notes')
        .then(async (res) => {
            for (let note of res.data) {
                const div = document.createElement('div');
                div.classList.add('tile');
                div.innerHTML = `<div class='tile-content'>
                                    <h4 class="note-title">${note.title}</h4>
                                    <p class="note-body">${note.body}</p>
                                    <div class="note-options">
                                        <button class="btn edit-btn" data-note='${JSON.stringify(note)}'><i class="far fa-edit"></i></button>
                                        <button class="btn delete-btn" data-note-id="${note._id}"><i class="far fa-trash-alt"></i></button>
                                    </div>
                                </div>`
                await grid.add(div);
            }
        })
        .catch((err) => {console.log(err)})
}
updateLayout();

const mainContent = document.querySelector('#main-content');
const overlay = document.querySelector('#overlay');

const newNoteForm = document.querySelector('#new-note-form');
const editNoteForm = document.querySelector('#edit-note-form')

const exitEditFormButton = document.querySelector('#exit-edit-form');
const submitEditFormButton = document.querySelector('#submit-edit-form');

const displayNotes = document.querySelector('#display-notes');
const notesContainer = document.querySelector('#notes-container');

const updateButton = document.querySelector('#update-button');
const deleteButtons = document.querySelectorAll('.delete-btn');
const editButtons = document.querySelectorAll('.edit-btn');

deleteButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const noteId = btn.dataset.noteId;
        const parent = btn.parentElement.parentElement.parentElement;

        deleteNote(noteId, parent);
    })
})

editButtons.forEach((btn) => {        
    btn.addEventListener('click', (e) => {
        editNote(btn);
    });
})

const deleteNote = (id, element) => {
    grid.remove([grid.getItem(element)], {
        removeElements: true,
    });
    
    axios.delete(`/${id}`)
        .then((res) => console.log('deleted'))
        .catch((err) => console.log(err))
}

const editNote = (btn) => {
    const noteData = JSON.parse(btn.dataset.note);

    const parent = grid.getItem(btn.parentElement.parentElement.parentElement);

    editNoteForm.elements['editNote[title]'].value = noteData.title;
    editNoteForm.elements['editNote[body]'].value = noteData.body;
    editNoteForm.dataset.noteId = noteData._id;
    editNoteForm.dataset.divId = parseInt(parent._id) - 2;

    mainContent.classList.add('blur-content');
    overlay.style.display = 'block';
}

// grid.on('layoutEnd', (items) => {
//     console.log(items);
// })

const resizeObserver = new ResizeObserver(entries => {
    const resizedDiv = entries[0];
    const resizedDivWidth = Math.floor(resizedDiv.borderBoxSize[0].inlineSize);
    const newDivWidth = Math.floor(resizedDivWidth/248) * 248;

    displayNotes.style.width = `${newDivWidth}px`;
    displayNotes.style.margin = `0 auto`;
})

resizeObserver.observe(notesContainer);

newNoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const note = {
        title: newNoteForm.elements['note[title]'].value,
        body: newNoteForm.elements['note[body]'].value
    }

    // console.log(note);
    axios.post('/new', note)
        .then((res) => {
            const div = document.createElement('div');
            div.classList.add('tile');
            div.innerHTML = `<div class='tile-content'>
                                <h4 class="note-title">${res.data.title}</h4>
                                <p class="note-body">${res.data.body}</p>
                                <div class="note-options">
                                    <button class="btn edit-btn" data-note='${JSON.stringify(res.data)}'><i class="far fa-edit"></i></button>
                                    <button class="btn delete-btn" data-note-id="${res.data._id}"><i class="far fa-trash-alt"></i></button>
                                </div>
                            </div>`
            grid.add(div);

            const deleteButton = div.children[0].children[2].children[1];
            const editButton = div.children[0].children[2].children[0];

            deleteButton.addEventListener('click', (e) => {
                deleteNote(res.data._id, div);
            })
            editButton.addEventListener('click', (e) => {
                editNote(editButton);
            })

        })
        .catch((error) => {console.log(error)});

    newNoteForm.reset();
})

submitEditFormButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    const activeDiv = grid.getItem(parseInt(editNoteForm.dataset.divId));
    const title = activeDiv._element.children[0].children[0];
    const body = activeDiv._element.children[0].children[1];
    console.log(title, body);

    const note = {
        _id: editNoteForm.dataset.noteId,
        title: editNoteForm.elements['editNote[title]'].value,
        body: editNoteForm.elements['editNote[body]'].value
    }
    
    axios.put(`/${note._id}`, note)
        .then((res) => {
            title.innerText = note.title;
            body.innerText = note.body;
            updateLayout();
        })
        .catch((err) => console.log(err));

    mainContent.classList.remove('blur-content');
    overlay.style.display = 'none';
})

exitEditFormButton.addEventListener('click', (e) => {
    e.preventDefault();
    mainContent.classList.remove('blur-content');
    overlay.style.display = 'none';
})

