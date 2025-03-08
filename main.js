async function fetchMarketData() {
    const itemId = document.getElementById("itemInput").value.trim();
    let itemId = document.getElementById("itemInput").value.trim();

    if (!itemId) {
        alert("⚠️ Please enter an item ID.");
        return;
    }

    const locations = ["Bridgewatch", "Martlock", "Lymhurst", "Thetford", "Fort Sterling"];
    const taxRate = document.getElementById("taxCheckbox").checked ? 0.04 : 0.08; // ✅ 4% sau 8%
    const setupFee = 0.025; // ✅ 2.5% setup fee

    try {
        // Apelăm API-ul Albion Online pentru a obține datele pentru itemul selectat
        const response = await fetch(`https://europe.albion-online-data.com/api/v2/stats/prices/${itemId}.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data for item ${itemId}`);
        }

        const data = await response.json();

        if (data.length === 0) {
            alert(`⚠️ No market data found for item ID: ${itemId}. Try another item.`);
            return;
        }

        let minSell = Infinity, maxSell = 0;
        let minCity = "N/A", maxCity = "N/A";
        let marketData = [];

        // Iterăm prin datele primite și calculăm cele mai mici și cele mai mari prețuri de vânzare
        data.forEach(entry => {
            const { city, sell_price_min, buy_price_max } = entry;

            if (sell_price_min > maxSell) {
                maxSell = sell_price_min;
                maxCity = city;
            }

            if (sell_price_min < minSell) {
                minSell = sell_price_min;
                minCity = city;
            }

            marketData.push({ city, sellOrder: sell_price_min, buyOrder: buy_price_max });
        });

        // Calculează profitul
        const sellAfterSetup = maxSell * (1 - setupFee);
        const finalSellPrice = sellAfterSetup * (1 - taxRate);
        const profit = (finalSellPrice - minSell).toFixed(2);

        displayData(marketData, profit, minCity, minSell, maxCity, maxSell, taxRate, setupFee);
    } catch (error) {
        console.error("❌ Error loading data:", error);
        alert("⚠️ Failed to load data. Check the item ID and try again.");
    }
}
        function displayData(data, profit, minCity, minSell, maxCity, maxSell, taxRate, setupFee) {
    const table = document.getElementById("marketTable");
    table.innerHTML = "<tr><th>City</th><th>Sell Order</th></tr>";

    // Afișăm datele pentru fiecare oraș
    data.forEach(row => {
        table.innerHTML += `<tr><td>${row.city}</td><td>${row.sellOrder}</td></tr>`;
    });

    // Verificăm dacă există profitabilitate
    if (profit !== "N/A" && profit !== undefined) {
        table.innerHTML += `<tr><th colspan="2">Best Transport Opportunity</th></tr>`;
        table.innerHTML += `<tr><td>Buy From</td><td>${minCity} (${minSell})</td></tr>`;
        table.innerHTML += `<tr><td>Sell To</td><td>${maxCity} (${maxSell})</td></tr>`;
        table.innerHTML += `<tr><td>Setup Fee</td><td>2.5%</td></tr>`;
        table.innerHTML += `<tr><td>Tax Applied</td><td>${(taxRate * 100).toFixed(0)}%</td></tr>`;
        table.innerHTML += `<tr><td>Profit</td><td>${profit}</td></tr>`;
    } else {
        table.innerHTML += `<tr><td colspan="2">No profitable transport found</td></tr>`;
    }
}
