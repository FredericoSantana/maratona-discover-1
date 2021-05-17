// Abrir e fechar a pop up de Novas transações
const Modal = {
    open() {
        //Abrir modal
        //Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close() {
        //fechar o Modal
        //remover a classe active do Modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

//Armazenamento dos dados no navegador
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        //pegar todas as transações
        // para cada transacao
        Transaction.all.forEach(transaction => {
            //se ela for maior do que zero
            if( transaction.amount > 0 ){
                //somar a uma variavel e retornar a variavel
                income = income + transaction.amount;
            }
        })

        return income;
    },
    expenses() {
        let expense = 0;
        //pegar todas as transações
        // para cada transacao
        Transaction.all.forEach(transaction => {
            //se ela for menor do que zero
            if( transaction.amount < 0 ){
                //somar a uma variavel e retornar a variavel
                expense = expense + transaction.amount;
            }
        })

        return expense;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

// Substituir os dados o HTML com os dados do JS

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" :
        "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
      
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
    
        `
        return html

    }, 

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransaction () {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        //o 'value', que é o dado inserido no formulário, é tipo string, aqui vai transformar em tipo number
        value = Number(value) * 100
        
        return Math.round(value)
    },

    formatDate(date) {
        //os dados vem no seguinte formato: 2021-05-17, abaixo vai mudar o formato
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    //coleta das informações passadas nos formulários
    //conexão entre o JS e o HTML, pegando o elemento inteiro
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    //conexão entre o JS e o HTML, pegando somente os valores
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    //verificar se todas as informações foram preenchidas
    validateFields() {
        //pegar todos os valores dos campos
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "" ) {
            throw new Error("Por favor, preencha todos os campos.")
        }

        console.log(Form.getValues())
    },

    // formatar os dados para salvar
    formatValues(){
        let { description, amount, date } = Form.getValues() //neste caso usa-se o 'let' pois os dados serão alterados, com o 'const' isso não é possível
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },

    //salvar os dados
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    // apagar os dados do formulario
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        //se alguma funcionalidade não acontecer, o sistema mostra o erro para preencher os campos corretamente
        try {
        //verificar se todas as informações foram preenchidas
        Form.validateFields()

        // formatar os dados para salvar
        const transaction = Form.formatValues()

        // salvar
        Form.saveTransaction(transaction)

        // apagar os dados do formulario
        Form.clearFields()

        //modal feche
        Modal.close()
        } catch (error) {
            alert(error.message)
        }

    }
}

//App
const App = {
    //inicialização do App, onde alimenta as transações
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()
        
        Storage.set(Transaction.all)
        },
    reload() {
        DOM.clearTransaction()
        App.init()
    },
}

App.init()