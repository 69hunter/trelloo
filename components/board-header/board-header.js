const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="../../styles/normalize.css">
  <link rel="stylesheet" href="../../styles/input-search.css">
  <style>
    :host {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      background-color: rgb(0, 0, 0, .35);
      color: #ffffff;
      padding: 8px;
    }

    .header-title {
      flex: 1 0 auto;
      font-size: 24px;
      font-weight: 600;
    }

    .header-search {
      flex: 0 0 auto;
      margin-right: 8px;
    }
  </style>

  <div class="header-title">Trelloo</div>
  <input class="header-search" type="search" name="search" placeholder="Search"></input>
`;

class BoardHeader extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    this._root.appendChild(template.content.cloneNode(true));
    this.$headerSearch = this._root.querySelector('.header-search');
    
    this.$headerSearch.addEventListener('input', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onSearch(this.$headerSearch.value);
    });
    this.$headerSearch.addEventListener('search', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onSearch(this.$headerSearch.value);
    });
  }

  onSearch(text) {
    this.dispatchEvent(new CustomEvent('onSearch', {
      detail: {
        text,
      }
    }));
  }
}

window.customElements.define('board-header', BoardHeader);