const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 340px;
      background-color: #edeff0;
      box-shadow: 0 0 6px 0 rgba(0,0,0,0.40);
      padding: 8px;
      border-radius: 4px;
      height: fit-content;
    }

    .container {
      padding: 8px;
    }

    .column-title {
      margin-bottom: 8px;
    }

    .column-title-edit {
      margin-bottom: 8px;
      width: 100%;
      box-sizing: border-box;
    }
  </style>

  <div class="container">
    <div class="column-add">+ Add Column</div>
    <div class="column-edit">
      <input class="column-title-edit" type="text" name="title"></input>
      <div id="button-container">
        <button id="cancel-button">Cancel</button>
        <button id="save-button">Save</button>
      </div>
    </div>
  </div>
`;

class BoardColumnCreate extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    this._root.appendChild(template.content.cloneNode(true));
    this.$columnAdd = this._root.querySelector('.column-add');
    this.$columnEdit = this._root.querySelector('.column-edit');
    this.$columnTitleEdit = this._root.querySelector('.column-title-edit');
    this.$cancelButton = this._root.querySelector('#cancel-button');
    this.$saveButton = this._root.querySelector('#save-button');

    this._render();

    this.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleEditMode();
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

  _render() {
    this._editMode = false;
    this.$columnAdd.hidden = false;
    this.$columnEdit.hidden = true;
    this.$columnTitleEdit.value = '';
  }

  toggleEditMode() {
    if (this._editMode) return;
    this.$columnAdd.hidden = true;
    this.$columnEdit.hidden = false;
  }

  onCancel() {
    this._render();
  }

  onSave() {
    this.dispatchEvent(new CustomEvent('onCreateColumn', {
      detail: {
        title: this.$columnTitleEdit.value
      }
    }));
  }

}

window.customElements.define('board-column-create', BoardColumnCreate);