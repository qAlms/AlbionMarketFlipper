async function fetchMarketData() {
    let itemId = document.getElementById("itemInput").value.trim();
    
    // Înlocuim spațiile cu "_", pentru a ne asigura că itemele cu mai multe cuvinte sunt corect procesate
    itemId = itemId.replace(/ /g, "_");

    if (!itemId) {
        alert("⚠️ Please enter an item ID.");
        return;
    }

    const locations = ["Bridgewatch", "Martlock", "Lymhurst", "Thetford", "Fort Sterling"];
    const taxRate = document.getElementById("taxCheckbox").checked ? 0.04 : 0.08; // ✅ 4% sau 8%
    const setupFee = 0.025; // ✅ 2.5% setup fee

    const url = `https://europe.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${locations.join(",")}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        console.log("🔍 API Response:", data); // ✅ Debugging: Afișează datele în consolă
        
        if (data.length === 0) {
            alert(`⚠️ No market data found for item ID: ${itemId}. Try another item.`);
            return;
        }

        let minSell = Infinity, maxSell = 0;
        let minCity = "N/A", maxCity = "N/A";
        let marketData = [];

        locations.forEach(city => {
            const cityData = data.filter(d => d.city === city);
            const sellOrders = cityData.filter(d => d.sell_price_min > 0);

            // Debugging: Verificăm ce date obținem pentru fiecare oraș
            console.log(`Data for ${city}:`, cityData);

            if (sellOrders.length > 0) {
                const cityMinSell = Math.min(...sellOrders.map(d => d.sell_price_min));

                if (cityMinSell < minSell) {
                    minSell = cityMinSell;
                    minCity = city;
                }

                if (cityMinSell > maxSell) {
                    maxSell = cityMinSell;
                    maxCity = city;
                }

                marketData.push({ city, sellOrder: cityMinSell });
            } else {
                marketData.push({ city, sellOrder: "N/A (No sell orders)" });
            }
        });

        // Verificăm dacă există o oportunitate de transport profitabilă
        if (maxSell > minSell && minCity !== maxCity) {
            const sellAfterSetup = maxSell * (1 - setupFee);
            const finalSellPrice = sellAfterSetup * (1 - taxRate);
            const profit = (finalSellPrice - minSell).toFixed(2);

            displayData(marketData, profit, minCity, minSell, maxCity, maxSell, taxRate, setupFee);
        } else {
            displayData(marketData, "N/A", minCity, minSell, maxCity, maxSell, taxRate, setupFee);
        }

    } catch (error) {
        console.error("❌ Error fetching data:", error);
        alert("⚠️ Failed to fetch data. Check the item ID and try again.");
    }
}

cosnt btnFor = document.getElementByID("btn1");

btnFor.addEventListener("click", fetchMarketData());

function displayData(data, profit, minCity, minSell, maxCity, maxSell, taxRate, setupFee) {
    const table = document.getElementById("marketTable");
    table.innerHTML = "<tr><th>City</th><th>Sell Order</th></tr>";

    // Afișăm datele pentru fiecare oraș
    data.forEach(row => {
        table.innerHTML += `<tr><td>${row.city}</td><td>${row.sellOrder}</td></tr>`;
    });

    // Verificăm dacă există profitabilitate
    if (profit !== "N/A") {
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
