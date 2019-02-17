const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      flex: 0 0 auto;
      display: flex;
      background-color: rgb(0, 0, 0, .15);
      color: #ffffff;
      padding: 8px;
    }

    .header-title {
      flex: 1 0 auto;
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