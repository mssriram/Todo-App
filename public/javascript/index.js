let grid = new Muuri('.grid', {
    dragEnabled: true,
    dragStartPredicate: {
        distance: 10,
        delay: 10,
    },
    itemDraggingClass: 'drag-class',
    itemReleasingClass: 'release-class'
})

const mainContent = document.querySelector('#main-content');
const overlay = document.querySelector('#overlay');

const newNoteForm = document.querySelector('#new-note-form');
const editNoteForm = document.querySelector('#edit-note-form')

const exitEditFormButton = document.querySelector('#exit-edit-form');
const submitEditFormButton = document.querySelector('#submit-edit-form');

const notesContainer = document.querySelector('#notes-container');

const editButtons = document.querySelectorAll('.edit-btn');
const deleteButtons = document.querySelectorAll('.delete-btn');
const colorButtons = document.querySelectorAll('input[type="radio"]');



deleteButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const noteId = btn.dataset.noteId;
        const parent = btn.closest('.tile');

        deleteNote(noteId, parent);
    })
})

editButtons.forEach((btn) => {        
    btn.addEventListener('click', (e) => {
        editNote(btn);
    });
})

colorButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        changeNoteColor(btn);
    })
})

const changeNewNoteHeight = () => {
    const bodyDiv = newNoteForm.elements['note[body]'];
    const lines = (bodyDiv.value.match(/\n/g)||[]).length + 1;
    const height = 120;  
    if (lines < 7){ 
        const calculatedHeight = height + (((lines - 4)>0 ? lines-4 : 0) * 23);                              //padding = 30px top and bottom
        bodyDiv.style.height = `${calculatedHeight}px`;
    }
    else{
        bodyDiv.style.height = `189px`;
    }
}

const updateLayout = (divId, note) => {
    let div = grid.getItem(divId);
    div._element.querySelector('.note-title').innerText = note.title;
    div._element.querySelector('.note-body').innerText = note.body;
    grid.remove([div], {removeElements: true});
    grid.add(div._element, {index: divId});

    div = grid.getItem(divId);

    grid.synchronize();
}

const deleteNote = (id, element) => {
    grid.remove([grid.getItem(element)], {
        removeElements: true,
    });
    
    axios.delete(`/${id}`)
        .then((res) => console.log('deleted'))
        .catch((err) => console.log(err))
}

const editNote = (btn) => {
    const noteId = btn.dataset.noteId;
    axios.get(`/${noteId}`)
        .then((res) => {
            console.log()
            const parent = grid.getItem(btn.closest('.tile'));

            editNoteForm.elements['editNote[title]'].value = res.data.title;
            editNoteForm.elements['editNote[body]'].value = res.data.body;  
            editNoteForm.dataset.noteId = res.data._id;
            editNoteForm.dataset.divId = grid._items.findIndex((currDiv) => currDiv === parent)

            mainContent.classList.add('blur-content');
            overlay.style.display = 'block';
        })
        .catch((err) => console.log(err));
}

const changeNoteColor = (btn) => {
    const note = btn.closest('.tile');
    const color = `${btn.dataset.color}`;
    note.classList.remove('default', 'red', 'blue', 'green', 'yellow', 'purple');
    note.classList.add(color);

    const noteId = btn.closest(".tile").dataset.noteId;
    axios.put(`/color/${noteId}`, {color: color})
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));
}

newNoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const note = {
        title: newNoteForm.elements['note[title]'].value,
        body: newNoteForm.elements['note[body]'].value,
        color: 'default',
    }

    axios.post('/new', note)
        .then((res) => {
            const div = document.createElement('div');
            div.classList.add('tile', note.color);
            div.dataset.noteId = res.data._id;
            div.innerHTML = `<div class='tile-content'>
                                <h4 class="note-title">${res.data.title}</h4>
                                <p class="note-body">${res.data.body}</p>
                                <div class="note-options">
                                    <button class="btn edit-btn" data-note-id="${res.data._id}"><span class="inline iconify-inline" data-icon="akar-icons:edit"></span></button>
                                    <button class="btn delete-btn" data-note-id="${res.data._id}"><span class="inline iconify-inline" data-icon="ant-design:delete-outlined"></span></button>
                                    <div class="color-picker">
                                        <button class="btn color-btn"><span class="color-picker-btn inline iconify-inline" data-icon="carbon:color-palette"></span></button>
                                        <div class="color-dropdown">
                                            <label class="color-container">
                                                <input type="radio" ${note.color==="default"?"checked":""} name="<%-note._id%>" data-color="default">
                                                <span class="checkmark default"></span>
                                            </label>
                                            <label class="color-container">
                                                <input type="radio" ${note.color==="red"?"checked":""} name="<%-note._id%>" data-color="red">
                                                <span class="checkmark red"></span>
                                            </label>
                                            <label class="color-container">
                                                <input type="radio" ${note.color==="green"?"checked":""} name="<%-note._id%>" data-color="green">
                                                <span class="checkmark green"></span>
                                            </label>
                                            <label class="color-container">
                                                <input type="radio" ${note.color==="blue"?"checked":""} name="<%-note._id%>" data-color="blue">
                                                <span class="checkmark blue"></span>
                                            </label>
                                            <label class="color-container">
                                                <input type="radio" ${note.color==="yellow"?"checked":""} name="<%-note._id%>" data-color="yellow">
                                                <span class="checkmark yellow"></span>
                                            </label>
                                            <label class="color-container">
                                                <input type="radio" ${note.color==="purple"?"checked":""} name="<%-note._id%>" data-color="purple">
                                                <span class="checkmark purple"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>`
            grid.add(div);
            
            const deleteButton = div.querySelector('.delete-btn');
            const editButton = div.querySelector('.edit-btn');
            const colorButtons = div.querySelectorAll('input[type="radio"]');

            // console.log(colorButtons)
            colorButtons.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    changeNoteColor(btn);
                })
            })

            deleteButton.addEventListener('click', (e) => {
                deleteNote(res.data._id, div);
            })
            editButton.addEventListener('click', (e) => {
                editNote(editButton);
            })

        })
        .catch((error) => {console.log(error)});

    newNoteForm.reset();
    newNoteForm.elements['note[body]'].style.height = `120px`;
})

newNoteForm.elements['note[body]'].addEventListener('input', (e) => {
    changeNewNoteHeight();
})

submitEditFormButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    const divId = parseInt(editNoteForm.dataset.divId);

    const note = {
        _id: editNoteForm.dataset.noteId,
        title: editNoteForm.elements['editNote[title]'].value,
        body: editNoteForm.elements['editNote[body]'].value
    }
    
    axios.put(`/${note._id}`, note)
        .then((res) => {
            updateLayout(divId, note)
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

const resizeObserver = new ResizeObserver(entries => {
    const displayNotes = document.querySelector('#display-notes');

    const resizedDiv = entries[0];
    const resizedDivWidth = Math.floor(resizedDiv.borderBoxSize[0].inlineSize);
    const divWidth = 220 + 30 + 2 + 16;
    const newDivWidth = Math.floor(resizedDivWidth/divWidth) * divWidth;

    displayNotes.style.width = `${newDivWidth}px`;
    displayNotes.style.margin = `0 auto`;
})

resizeObserver.observe(notesContainer);