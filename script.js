let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Format month to "Month Year"
function formatMonth(monthStr) {
    const date = new Date(monthStr + "-01");
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function addExpense() {
    const amount = document.getElementById("amount").value.trim();
    const category = document.getElementById("category").value.trim();
    const month = document.getElementById("month").value;

    if (!amount || !category || !month) {
        alert("Please fill all fields");
        return;
    }

    if (Number(amount) <= 0) {
        alert("Amount must be positive");
        return;
    }

    const expense = { amount: Number(amount), category, month };
    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("month").value = "";

    displayExpenses();
}

function displayExpenses(filtered = null) {
    const list = document.getElementById("expense-list");
    const total = document.getElementById("total");
    const categoryTotalList = document.getElementById("category-total");

    list.innerHTML = "";
    categoryTotalList.innerHTML = "";

    let sum = 0;
    let categoryTotals = {};

    const data = filtered || expenses;

    data.forEach(expense => {
        sum += expense.amount;
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;

        const li = document.createElement("li");
        const index = expenses.indexOf(expense); // actual index for deletion
        li.innerHTML = `${formatMonth(expense.month)} - ${expense.category} - ₹${expense.amount} 
                        <button onclick="deleteExpense(${index})">X</button>`;
        list.appendChild(li);
    });

    total.innerText = sum;

    for (const cat in categoryTotals) {
        const li = document.createElement("li");
        li.textContent = `${cat} : ₹${categoryTotals[cat]}`;
        categoryTotalList.appendChild(li);
    }

    drawChart(categoryTotals);
}

function deleteExpense(index) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    displayExpenses();
}

// Flatpickr Month Select
flatpickr("#month", {
    plugins: [new monthSelectPlugin({
        shorthand: true,
        dateFormat: "Y-m",
        altFormat: "F Y"
    })]
});

flatpickr("#filter-month", {
    plugins: [new monthSelectPlugin({
        shorthand: true,
        dateFormat: "Y-m",
        altFormat: "F Y"
    })]
});

function filterByMonth() {
    const filterMonth = document.getElementById("filter-month").value;
    if (!filterMonth) {
        displayExpenses();
        return;
    }
    const filtered = expenses.filter(e => e.month === filterMonth);
    displayExpenses(filtered);
}

function drawChart(categoryTotals) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (window.expenseChart) window.expenseChart.destroy();

    window.expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                label: 'Expenses by Category',
                data: Object.values(categoryTotals),
                backgroundColor: Object.keys(categoryTotals).map(() => 'rgba(0,123,255,0.5)'),
                borderColor: Object.keys(categoryTotals).map(() => 'rgba(0,123,255,1)'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Initial display
displayExpenses();
