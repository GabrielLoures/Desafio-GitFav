import { GitHubAPI } from "./APIconsumer.js";

export class Favorites {

  constructor(root) {
    this.root = document.querySelector(root);
    this.load()
  }

  load() { // essa função é responsável por recriar o array que serão guardados os rows da API
  
    this.entries = JSON.parse(localStorage.getItem('@github.fav:')) || []; // pegue tudo que está no array do localStorage e transforme de string para dado; se não existir nada no array, ou seja, se ele for null ou undefined, retorne um array vazio
  }

  save() {

    localStorage.setItem('@github.fav:', JSON.stringify(this.entries)); // comando que pega o this.entries, transforma em string (stringify) e guarda no localStorage de nome '@github.fav:'
  }

  delete(user) {

    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }

  async add(username) {
    
    try {
      const sameUser = this.entries.find(entry => entry.login === username)

      if(sameUser) {
        throw new Error(`Usuário já está cadastrado.`)
      }

      const user = await GitHubAPI.search(username)

      if(user.login === undefined) {
        throw new Error(`Usuário não foi encontrado. Tente novamente.`)
      }

      this.entries = [user, ...this.entries]

      this.update()
      this.save()
    } catch(error) {
      alert(error.message)
    }
  }

}

export class FavoritesView extends Favorites {

  constructor(root) {
    super(root);

    this.table = this.root.querySelector('table')

    this.update()
    this.addRowOnButton()
  }

   changeTable() {
     
     if(this.entries.length > 0) {
      const emptyTable = this.root.querySelector('.no-favs')
      emptyTable.classList.add('hide')
     }
     if(this.entries.length == 0) {
      const emptyTable = this.root.querySelector('.no-favs')
      emptyTable.classList.remove('hide')
     }
   }

  addRowOnButton() {
    const addButton = this.root.querySelector('.inp-btn button')

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.inp-btn input')

      this.add(value)
    }
  }

  update() {

    this.removeAllTr()

    this.entries.forEach((user) => {

      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png` 
      row.querySelector('.user img').alt = `Avatar do ${user.name}` 
      row.querySelector('.user a').href = `https://github.com/${user.login}` 
      row.querySelector('.user a p').textContent = user.name 
      row.querySelector('.user a span').textContent = `/${user.login}` 
      row.querySelector('.repos').textContent = user.public_repos 
      row.querySelector('.followers').textContent = user.followers
      
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')

        if(isOk) {
          this.delete(user)
        }
      }

      this.table.append(row)
    })

    this.changeTable()
  }

  createRow() {

    const tr = document.createElement('tr')

    const content = `
        <td class="user">
          <img src="https://github.com/maykbrito.png" alt="Avatar do Mayk Brito">
          <a href="https://github.com/maykbrito" target="_blank">
            <p>Mayk Brito</p>
            <span>/maykbrito</span>
          </a>
        </td>
        <td class="repos">23</td>
        <td class="followers">112321</td>
        <td>
          <button class="remove">Remover</button>
        </td>
    `
    tr.innerHTML = content

    return tr

  }

  removeAllTr() {

    this.table.querySelectorAll('tr')
      .forEach( (tr) => {
        tr.remove()
      })
  }
}