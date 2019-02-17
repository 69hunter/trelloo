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

    .card-description-edit {
      margin: 8px 0;
      width: 100%;
      box-sizing: border-box;
    }
  </style>

  <div class="container">
    <div class="card-add">+ Add card</div>
    <div class="card-edit">
      <input class="card-title-edit" type="text" name="title" placeholder="Title"></input>
      <div class="card-title-edit-error"></div>
      <textarea class="card-description-edit" placeholder="Description"></textarea>
      <div id="button-container">
        <button id="cancel-button" class="primary-button">Cancel</button>
        <button id="save-button" class="primary-button">Save</button>
      </div>
    </div>
  </div>
`;

class BoardCardCreate extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    this._root.appendChild(template.content.cloneNode(true));
    this.$cardAdd = this._root.querySelector('.card-add');
    this.$cardEdit = this._root.querySelector('.card-edit');
    this.$cardTitleEdit = this._root.querySelector('.card-title-edit');
    this.$cardTitleEditError = this._root.querySelector('.card-title-edit-error');
    this.$cardDescriptionEdit = this._root.querySelector('.card-description-edit');
    this.$cancelButton = this._root.querySelector('#cancel-button');
    this.$saveButton = this._root.querySelector('#save-button');

    this._render();

    this.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleEditMode();
    });
    this.$cardTitleEdit.addEventListener('input', (e) => {
      e.preventDefault();
      this.toggleEditError();
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
    })
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

  _render() {
    this._editMode = false;
    this.$cardAdd.hidden = false;
    this.$cardEdit.hidden = true;
    this.$cardTitleEdit.value = '';
    this.$cardDescriptionEdit.value = '';
    this.$cardTitleEditError.hidden = true;
  }

  get repeatTitle() {
    return this._allCards
      .map(item => item.title)
      .includes(this.$cardTitleEdit.value);
  }

  toggleEditMode() {
    if (this._editMode) return;
    this.$cardAdd.hidden = true;
    this.$cardEdit.hidden = false;
  }

  toggleEditError() {
    if (this.repeatTitle) {
      this.$cardTitleEditError.hidden = false;
      this.$cardTitleEditError.textContent = 'Title should not repeat';
    } else if (!this.$cardTitleEdit.value) {
      this.$cardTitleEditError.hidden = false;
      this.$cardTitleEditError.textContent = 'Title is required';
    } else {
      this.$cardTitleEditError.hidden = true;
    }
  }

  onCancel() {
    this._render();
  }

  onSave() {
    this.toggleEditError();
    if (this.repeatTitle || !this.$cardTitleEdit.value) return;
    this.dispatchEvent(new CustomEvent('onCardCreate', {
      detail: {
        title: this.$cardTitleEdit.value,
        description: this.$cardDescriptionEdit.value,
      }
    }));
  }

}

window.customElements.define('board-card-create', BoardCardCreate);