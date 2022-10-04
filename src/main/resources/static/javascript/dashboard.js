if (document.cookie === "") {

    window.location.replace("login.html")
}

function handleLogout() {
    let c = document.cookie.split(";")
    for (let i in c) {
        document.cookie = /^[^=]+/.exec(c[i])[0] + "=;expires=" + new Date(0).toUTCString()
    }
}

function getId() {
    return Number(document.cookie.split("=")[1])
    // return Number(decodeURIComponent(document.cookie).split(";")[1].replace(" userId=", ""))
}

const budgetDiv = document.querySelector(".budget-div")
const incomeDiv = document.querySelector(".income-div")
const userLogs = document.querySelector(".logs")
const userId = getId();


fetch(`http://localhost:8080/api/v1/users/${userId}`)
    .then(res => res.json())
    .then(data => {
        const {incomeHistory, logs, basicStat} = data
        const {
            lowestIncome,
            highestIncome,
            averageBudget,
            highestBudget,
            lowestBudget,
            averageIncome,
            income,
            budgetTotal
        } = basicStat
        document.querySelector(".username").innerHTML += data.username.replace(/^./, data.username[0].toUpperCase());
        document.querySelector(".expense").insertAdjacentHTML("beforeend", budgetTotal)

        document.querySelector(".income").insertAdjacentHTML("beforeend", income)
        document.querySelector(".balance").insertAdjacentHTML("beforeend", Number(income - budgetTotal))


        document.querySelector(".avg-income").innerHTML = averageIncome
        document.querySelector(".avg-budget").innerHTML = averageBudget
        document.querySelector(".highest-income").innerHTML = highestIncome
        document.querySelector(".lowest-income").innerHTML = lowestIncome
        document.querySelector(".high-budget").innerHTML = highestBudget
        document.querySelector(".low-budget").innerHTML = lowestBudget

        incomeHistory.map(val => {
            incomeDiv.insertAdjacentHTML("beforeend", `
                <li class="list-group-item d-flex justify-content-between align-items-center item-el">
                        ${val.income} 
                         <button type="button" onclick="editIncome(${val.id})" class="btn btn-link" >edit</button>
                         <button type="button" onclick="deleteIncome(${val.id})" class="btn btn-link" >delete</button>
                    <span >${val.date}</span>
                 </li>`
            )
        })
        logs.map(x => {
            userLogs.insertAdjacentHTML("beforeend",
                `<li class="list-group-item d-flex justify-content-between align-items-center item-el">
                        ${x.action}
                        <span >${x.date}</span>
                    </li>`)
        })
    })
const deleteIncome = async (id) => {
    await fetch(`http://localhost:8080/api/v1/users/income/${userId}/${id}`, {
        method: "DELETE", headers: {'Content-Type': "application/json"}
    })
        .then(res => res.json())
        .then(data => window.location.reload())
        .catch(err => console.error(err.message))
}


const editIncome = async (id) => {
    $('#editIncomeModal').modal('toggle')
    const doIncomeEdit = async () => {
        const incomeBody = {
            userId,
            incomeId: id,
            newIncome: Number(document.getElementById("edit-income").value)
        }
        await fetch(`http://localhost:8080/api/v1/users/income/update`, {
            method: "PUT", headers: {'Content-Type': "application/json"},
            body: JSON.stringify(incomeBody)
        })
            .then(res => res.json())
            .then(data => window.location.reload())
            .catch(err => console.error(err.message))
    }
    document.querySelector(".edit-income-btn").addEventListener("click", doIncomeEdit)
}

fetch(`http://localhost:8080/api/v1/users/budget/${userId}`, {
    headers: {'Content-Type': 'application/json',},
})
    .then(res => res.json())
    .then(data => {
        data.map(budget => {
            budgetDiv.insertAdjacentHTML("beforeend", `
            <li class="list-group-item d-flex justify-content-between align-items-center item-el">
                        ${budget.item} 
                        <span class="badge bg-primary rounded-pill price-el">$ ${budget.price}</span>
                        <button type="button" class="btn btn-link" onclick="editBudget(${budget.id})">edit</button>
                        <button onclick="deleteBudget(${budget.id})" type="button" class="btn btn-link">delete</button>               
             </li>`)
        })
    })


document.querySelector(".btn").addEventListener("click", handleLogout)


const deleteBudget = async (id) => {
    await fetch(`http://localhost:8080/api/v1/budgets/${userId}/${id}`, {
        method: "DELETE", headers: {'Content-Type': "application/json"}
    })
        .then(res => res.json())
        .then(data => window.location.reload())
        .catch(err => console.error(err.message))
}

const editBudget = async (id) => {
    $('#exampleModal2').modal('toggle')
    const doEdit = async () => {
        const budgetBody = {
            userId,
            budgetItemId: id,
            newItemName: document.getElementById("edit-item-name").value,
            newItemPrice: Number(document.getElementById("edit-item-price").value)
        }
        console.log(budgetBody)
        await fetch(`http://localhost:8080/api/v1/budgets/updateItem`, {
            method: "PUT", headers: {'Content-Type': "application/json"},
            body: JSON.stringify(budgetBody)
        })
            .then(res => res.json())
            .then(data => window.location.reload())
            .catch(err => console.error(err.message))
    }
    document.querySelector(".edit-btn").addEventListener("click", doEdit)
}

const handleBudget = (event) => {
    event.preventDefault();
    const budgetBody = {
        item: document.getElementById("budget-input").value,
        userId,
        price: Number(document.getElementById("budget-amount").value)
    }
    fetch(`http://localhost:8080/api/v1/budgets/addItem`, {
        method: "POST", body: JSON.stringify(budgetBody),
        headers: {'Content-Type': "application/json",}
    }).then(res => res.json())
        .then(data => window.location.reload())
}
document.querySelector(".submit-button").addEventListener("click", handleBudget)

const addIncome = (event) => {
    event.preventDefault()
    const incomeBody = {income: Number(document.getElementById("income").value), userId,}
    fetch(`http://localhost:8080/api/v1/users/income`, {
        method: "POST", body: JSON.stringify(incomeBody),
        headers: {'Content-Type': 'application/json',},
    }).then(res => res.json())
        .then(data => window.location.reload())
        .catch(err => console.error(err.message))
}
document.querySelector(".sbtn-income").addEventListener("click", addIncome)