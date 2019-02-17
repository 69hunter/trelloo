const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="../../styles/normalize.css">
  <link rel="stylesheet" href="../../styles/input-text.css">
  <link rel="stylesheet" href="../../styles/textarea.css">
  <link rel="stylesheet" href="../../styles/primary-button.css">
  <style>
    :host {
      display: block;
      background-color: #F8F9F9;
      color: #333333;
      box-shadow: 0 0 6px 0 rgba(0,0,0,0.40);
      border-radius: 4px;
      cursor: pointer;
    }

    .container {
      padding: 8px;
    }

    .card-title-edit {
      width: 100%;
      box-sizing: border-box;
    }

    .card-title-edit-error {
      color: #ff0000;
      font-size: 12px;
    }

    .card-details {
      margin: 8px 0;
    }

    .card-description {
      margin-bottom: 8px;
    }

    .card-description-edit {
      margin-bottom: 8px;
      width: 100%;
      box-sizing: border-box;
    }
  </style>

  <div class="container" draggable="true">
    <div class="card-title"></div>
    <input class="card-title-edit" type="text" name="title" placeholder="Title"></input>
    <div class="card-title-edit-error">Title should not repeat</div>
    <div class="card-details">
      <div class="card-description"></div>
      <textarea class="card-description-edit" rows="5" placeholder="Description"></textarea>
      <div id="primary-button-container">
        <button id="edit-button" class="primary-button">Edit</button>
        <button id="delete-button" class="primary-button">Delete</button>
      </div>
      <div id="secondary-button-container">
        <button id="cancel-button" class="primary-button">Cancel</button>
        <button id="save-button" class="primary-button">Save</button>
      </div>
    </div>
  </div>
`;

class BoardCard extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    this._root.appendChild(template.content.cloneNode(true));
    this._content = this.content;

    this.$container = this._root.querySelector('.container');
    this.$cardTitle = this._root.querySelector('.card-title');
    this.$cardTitleEdit = this._root.querySelector('.card-title-edit');
    this.$cardTitleEditError = this._root.querySelector('.card-title-edit-error');
    this.$cardDescription = this._root.querySelector('.card-description');
    this.$cardDescriptionEdit = this._root.querySelector('.card-description-edit');
    this.$cardDetails = this._root.querySelector('.card-details');
    this.$primaryButtonContainer = this._root.querySelector('#primary-button-container');
    this.$secondaryButtonContainer = this._root.querySelector('#secondary-button-container');
    this.$editButton = this._root.querySelector('#edit-button');
    this.$deleteButton = this._root.querySelector('#delete-button');
    this.$cancelButton = this._root.querySelector('#cancel-button');
    this.$saveButton = this._root.querySelector('#save-button');

    this._render();

    this.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleDescription();
    });
    this.$container.addEventListener('dragstart', (e) => {
      this.dragStart(e);
    })
    this.$cardTitleEdit.addEventListener('input', (e) => {
      e.preventDefault();
      this.toggleEditError();
    });
    this.$editButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onEdit();
    });
    this.$deleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onDelete();
    });
    this.$cancelButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onCancel();
    });
    this.$saveButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onSave();
    });
    document.addEventListener('click', (e) => {
      if (!this._root.contains(e.path[0])) {
        this._render();
      }
    });
  }

  static get observedAttributes() {
    return ['all-cards'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'all-cards':
        this._allCards = JSON.parse(newValue);
        break;
      default:
        break;
    }
  }

  _render(opendetail) {
    this._editMode = false;
    this.$primaryButtonContainer.hidden = false;
    this.$secondaryButtonContainer.hidden = true;
    this.$cardDetails.hidden = !opendetail;
    this.$cardTitle.hidden = false;
    this.$cardTitleEdit.hidden = true;
    this.$cardTitleEditError.hidden = true;
    this.$cardDescription.hidden = false;
    this.$cardDescriptionEdit.hidden = true;
    this.$cardTitle.textContent = this._content.title;
    this.$cardTitleEdit.value = this._content.title;
    this.$cardDescription.textContent = this._content.description;
    this.$cardDescriptionEdit.value = this._content.description;
  }

  get repeatTitle() {
    return this._allCards
      .filter(item => item.id !== parseInt(this._content.id, 10))
      .map(item => item.title)
      .includes(this.$cardTitleEdit.value);
  }

  toggleDescription() {
    if (this._editMode) return;
    this.$cardDetails.hidden = !this.$cardDetails.hidden;
  }

  toggleEditError() {
    this.$cardTitleEditError.hidden = !this.repeatTitle;
  }

  onEdit() {
    this._editMode = true;
    this.$secondaryButtonContainer.hidden = false;
    this.$primaryButtonContainer.hidden = true;
    this.$cardTitleEdit.hidden = false;
    this.$cardTitle.hidden = true;
    this.$cardDescriptionEdit.hidden = false;
    this.$cardDescription.hidden = true;
  }

  onDelete() {
    this.dispatchEvent(new CustomEvent('onCardDelete', {
      detail: {
        id: this._content.id,
      }
    }));
  }

  onCancel() {
    this._render(true);
  }

  onSave() {
    if (this.repeatTitle) return;
    this._content.title = this.$cardTitleEdit.value;
    this._content.description = this.$cardDescriptionEdit.value;
    this._render(true);
    this.dispatchEvent(new CustomEvent('onCardUpdate', {
      detail: {
        id: this._content.id,
        title: this.$cardTitleEdit.value,
        description: this.$cardDescriptionEdit.value,
      }
    }));
  }

  dragStart(e) {
    e.dataTransfer.setData('text/plain', JSON.stringify(this._content));
  }
}

window.customElements.define('board-card', BoardCard);