const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      flex: 0 0 auto;
      display: block;
      background-color: rgb(0, 0, 0, .15);
      color: #ffffff;
      padding: 8px;
    }
  </style>
  <div>Trelloo</div>
`;

class BoardHeader extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    this._root.appendChild(template.content.cloneNode(true));
  }
}

window.customElements.define('board-header', BoardHeader);