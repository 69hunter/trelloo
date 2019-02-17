const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 340px;
      background-color: #edeff0;
      box-shadow: 0 0 6px 0 rgba(0,0,0,0.40);
      border-radius: 4px;
      height: fit-content;
    }

    .container {
      padding: 8px;
    }

    [hidden] {
      display: none !important;
    }

    .column-header {
      display: flex;
      direction: row;
      margin-bottom: 8px;
    }

    .column-header-edit {
      margin-bottom: 8px;
    }

    .column-title-edit {
      margin-bottom: 8px;
      width: 100%;
      box-sizing: border-box;
    }

    .column-title {
      flex: 1 0 auto;
    }

    #delete-button {
      flex: 0 0 auto;
    }

    .column-content *:not(:last-child) {
      margin-bottom: 8px;
    }
  </style>

  <div class="container">
    <div class="column-header">
      <div class="column-title"></div>
      <button id="delete-button">X</button>
    </div>
    <div class="column-header-edit">
      <input class="column-title-edit" type="text" name="title"></input>
      <div id="button-container">
        <button id="cancel-button">Cancel</button>
        <button id="save-button">Save</button>
      </div>
    </div>
    <div class="column-content"></div>
  </div>
`;

class BoardColumn extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    this._root.appendChild(template.content.cloneNode(true));
    this._title = this.title;
    this._cards = this.cards;
    this._id = this.id;
    this.$columnHeader = this._root.querySelector('.column-header');
    this.$columnHeaderEdit = this._root.querySelector('.column-header-edit');
    this.$columnTitle = this._root.querySelector('.column-title');
    this.$columnTitleEdit = this._root.querySelector('.column-title-edit');
    this.$columnContent = this._root.querySelector('.column-content');
    this.$deleteButton = this._root.querySelector('#delete-button');
    this.$cancelButton = this._root.querySelector('#cancel-button');
    this.$saveButton = this._root.querySelector('#save-button');

    this._render();

    this.$columnHeader.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleEditMode();
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
        this._renderColumnHeader();
      }
    })
  }

  _render() {
    this._renderColumnHeader();

    this._cards.forEach((card) => {
      const $item = document.createElement('board-card');
      $item.content = card;
      $item.addEventListener('onCardUpdate', this.updateCard.bind(this));
      $item.addEventListener('onCardDelete', this.deleteCard.bind(this));
      this.$columnContent.appendChild($item);
    });

    const $boardCardCreate = document.createElement('board-card-create');
    $boardCardCreate.addEventListener('onCardCreate', this.createCard.bind(this));
    this.$columnContent.appendChild($boardCardCreate);
  }

  _renderColumnHeader() {
    this._editMode = false;
    this.$columnHeader.hidden = false;
    this.$columnHeaderEdit.hidden = true;
    this.$columnTitle.textContent = this._title;
    this.$columnTitleEdit.value = this._title;
  }

  toggleEditMode() {
    if (this._editMode) return;
    this.$columnHeader.hidden = true;
    this.$columnHeaderEdit.hidden = false;
  }

  onCancel() {
    this._renderColumnHeader();
  }

  onSave() {
    this._title = this.$columnTitleEdit.value;
    this._renderColumnHeader();
    this.dispatchEvent(new CustomEvent('onUpdateColumn', {
      detail: {
        id: this._id,
        title: this._title,
      }
    }));
  }

  onDelete() {
    this.dispatchEvent(new CustomEvent('onDeleteColumn', {
      detail: {
        columnId: this._id,
      }
    }));
  }

  createCard(e) {
    this.dispatchEvent(new CustomEvent('onCreateCard', {
      detail: {
        ...e.detail,
        columnId: this._id,
      }
    }));
  }

  updateCard(e) {
    this.dispatchEvent(new CustomEvent('onUpdateCard', {
      detail: {
        ...e.detail,
        columnId: this._id,
      }
    }));
  }

  deleteCard(e) {
    this.dispatchEvent(new CustomEvent('onDeleteCard', { detail: e.detail }));
  }
}

window.customElements.define('board-column', BoardColumn);