const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-flow: column;
      height: 100vh;
      background-color: rgb(0, 121, 191);
    }

    #scroll-container {
      display: flex;
      flex: 1 0 auto;
      overflow-x: scroll;
      width: 100%;
    }

    #column-container {
      display: inline-flex;
      padding: 8px;
      width: auto;
    }

    #column-container board-column:not(:last-child) {
      margin-right: 8px;
    }
  </style>

  <board-header></board-header>
  <div id="scroll-container">
    <div id="column-container"></div>
  </div>
`;

class BoardContainer extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ 'mode': 'open' });
    this._data = {
      columns: [],
      cards: []
    };
  }

  connectedCallback() {
    this._root.appendChild(template.content.cloneNode(true));
    this.$columnContainer = this._root.querySelector('#column-container');
    this.$boardHeader = this._root.querySelector('board-header');
    this.$boardHeader.addEventListener('onSearch', this.searchCard.bind(this));
    this._fetchData();
  }

  _fetchData() {
    Promise.all(
      [
        fetch('http://localhost:3000/columns'),
        fetch('http://localhost:3000/cards'),
      ]
    )
      .then(response => Promise.all(response.map(r => r.json())))
      .then(([columns, cards]) => {
        console.log('columns: ', JSON.stringify(columns));
        console.log('cards: ', JSON.stringify(cards));
        this._data.columns = columns;
        this._data.cards = cards;
        this._render();
      })
      .catch(error => console.error('Error:', error));
  }

  _render() {
    this.$columnContainer.innerHTML = '';
    this._data.columns.forEach((column) => {
      const $item = document.createElement('board-column');
      $item.setAttribute('title', column.title);
      $item.id = column.id;

      const columnCards = this._data.cards.filter(item => item.columnId === column.id && !item.hide);
      $item.cards = columnCards;
      $item.setAttribute('all-cards', JSON.stringify(this._data.cards));
      $item.setAttribute('all-columns', JSON.stringify(this._data.columns));
      $item.addEventListener('onUpdateColumn', this.updateColumn.bind(this));
      $item.addEventListener('onDeleteColumn', this.deleteColumn.bind(this));
      $item.addEventListener('onCreateCard', this.createCard.bind(this));
      $item.addEventListener('onUpdateCard', this.updateCard.bind(this));
      $item.addEventListener('onDeleteCard', this.deleteCard.bind(this));
      this.$columnContainer.appendChild($item);
    });

    const $boardColumnCreate = document.createElement('board-column-create');
    $boardColumnCreate.setAttribute('all-columns', JSON.stringify(this._data.columns));
    $boardColumnCreate.addEventListener('onCreateColumn', this.createColumn.bind(this));
    this.$columnContainer.appendChild($boardColumnCreate);
  }

  searchCard(e) {
    this._queryText = e.detail.text;
    this._data.cards.forEach((card) => {
      card.hide = !(card.description.includes(this._queryText) || card.title.includes(this._queryText))
    })
    this._render();
  }

  updateColumn(e) {
    const id = e.detail.id;
    const data = {
      title: e.detail.title,
    };

    fetch(`http://localhost:3000/columns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response));
        this._data.columns.forEach((column) => {
          if (column.id === parseInt(id, 10)) column.title = response.title;
          return column;
        })
        this._render();
      })
      .catch(error => console.error('Error:', error));
  }

  deleteColumn(e) {
    const columnId = e.detail.columnId;

    fetch(`http://localhost:3000/columns/${columnId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response));
        this._data.columns = this._data.columns
          .filter(column => column.id !== parseInt(columnId, 10));
        this._render();
      })
      .catch(error => console.error('Error:', error));
  }

  createCard(e) {
    const data = {
      title: e.detail.title,
      description: e.detail.description,
      columnId: parseInt(e.detail.columnId, 10),
    };
    fetch(`http://localhost:3000/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response));
        this._data.cards.push(
          {
            ...response,
            hide: this._queryText ? !(response.description.includes(this._queryText) || response.title.includes(this._queryText)) : false,
          }
        );
        this._render();
      })
      .catch(error => console.error('Error:', error));
  }

  updateCard(e) {
    const id = e.detail.id;
    const data = {
      title: e.detail.title,
      description: e.detail.description,
      columnId: parseInt(e.detail.columnId, 10),
    };

    fetch(`http://localhost:3000/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response));
        this._data.cards.forEach((card) => {
          if (card.id === parseInt(id, 10)) {
            card.title = response.title;
            card.description = response.description;
            card.columnId = response.columnId;
          }
          return card;
        })
        this._render();
      })
      .catch(error => console.error('Error:', error));
  }

  deleteCard(e) {
    const id = e.detail.id;
    fetch(`http://localhost:3000/cards/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response));
        this._data.cards = this._data.cards
          .filter(card => card.id !== parseInt(id, 10));
        this._render();
      })
      .catch(error => console.error('Error:', error));
  }

  createColumn(e) {
    const data = e.detail;
    fetch('http://localhost:3000/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response));
        this._data.columns.push(response);
        this._render();
      })
      .catch(error => console.error('Error:', error));
  }
}

window.customElements.define('board-container', BoardContainer);