const mainContent = document.querySelector('#main-content');
const overlay = document.querySelector('#overlay');

const newNoteForm = document.querySelector('#new-note-form');
const editNoteForm = document.querySelector('#edit-note-form')

const exitEditFormButton = document.querySelector('#exit-edit-form');
const submitEditFormButton = document.querySelector('#submit-edit-form');

const deleteButtons = document.querySelectorAll('.delete-btn');
const editButtons = document.querySelectorAll('.edit-btn');

const displayNotes = document.querySelector('#display-notes');
const notesContainer = document.querySelector('#notes-container');

window.onload = () => {
    let grid = new Muuri('.grid', {
        dragEnabled: true,
        dragStartPredicate: {
            distance: 10,
            delay: 10,
        },
        itemDraggingClass: 'drag-class',
        itemReleasingClass: 'release-class'
    })   

    grid.on('layoutEnd', (items) => {
        console.log(items);
    })

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
        // console.log(form.elements['note[title]'].value);
        const note = {
            title: newNoteForm.elements['note[title]'].value,
            body: newNoteForm.elements['note[body]'].value
        }
    
        // console.log(note);
        axios.post('/new', note)
            .then((response) => {
                const div = document.createElement('div');
                div.classList.add('tile');
                div.innerHTML = `<div class='tile-content'><h4 class="note-title">${note.title}</h4><p class="note-body">${note.body}</p></div>`
                grid.add(div);
            })
            .catch((error) => {console.log(error)});
    
        newNoteForm.reset();
    })

    submitEditFormButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        const note = {
            _id: editNoteForm.dataset.noteId,
            title: editNoteForm.elements['editNote[title]'].value,
            body: editNoteForm.elements['editNote[body]'].value
        }
        
        axios.put(`/${note._id}`, note)
            .then((res) => console.log('updated'))
            .catch((err) => console.log(err));

        mainContent.classList.remove('blur-content');
        overlay.style.display = 'none';
    })

    exitEditFormButton.addEventListener('click', (e) => {
        e.preventDefault();
        mainContent.classList.remove('blur-content');
        overlay.style.display = 'none';
    })

    deleteButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const noteId = btn.dataset.noteId;
            const parent = btn.parentElement.parentElement.parentElement;

            grid.remove([grid.getItem(parent)], {
                removeElements: true,
            });
            
            axios.delete(`/${noteId}`)
                .then((res) => console.log('deleted'))
                .catch((err) => console.log(err))
        })
    })

    editButtons.forEach((btn) => {        
        btn.addEventListener('click', (e) => {
            const noteData = JSON.parse(btn.dataset.note);

            editNoteForm.elements['editNote[title]'].value = noteData.title;
            editNoteForm.elements['editNote[body]'].value = noteData.body;

            editNoteForm.dataset.noteId = noteData._id;

            mainContent.classList.add('blur-content');
            overlay.style.display = 'block';
        });
    })
}
