async function fetchMarketData() {
    let itemsInput = document.getElementById("itemInput").value.trim();
    
    // Înlocuim spațiile cu "_", pentru a ne asigura că itemele cu mai multe cuvinte sunt corect procesate
    const items = itemsInput.split(",").map(item => item.trim().replace(/ /g, "_"));

    if (items.length === 0 || items.some(item => !item)) {
        alert("⚠️ Please enter valid item IDs.");
        return;
    }

    const locations = ["Bridgewatch", "Martlock", "Lymhurst", "Thetford", "Fort Sterling"];
    const taxRate = document.getElementById("taxCheckbox").checked ? 0.04 : 0.08; // ✅ 4% sau 8%
    const setupFee = 0.025; // ✅ 2.5% setup fee

    try {
        let marketData = [];
        
        // Loop through all items and fetch their market data
        for (const itemId of items) {
            const url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${locations.join(",")}`;
            
            console.log(`Fetching data for: ${itemId}`); // Debugging: Show itemId

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`🔍 API Response for ${itemId}:`, data);

            if (data.length === 0) {
                alert(`⚠️ No market data found for item ID: ${itemId}. Try another item.`);
                continue;
            }

            let minSell = Infinity, maxSell = 0;
            let minCity = "N/A", maxCity = "N/A";

            locations.forEach(city => {
                const cityData = data.filter(d => d.city === city);
                const sellOrders = cityData.filter(d => d.sell_price_min > 0);

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
                }
            });

            marketData.push({ itemId, minCity, minSell, maxCity, maxSell });
        }

        displayData(marketData, taxRate, setupFee);
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        alert("⚠️ Failed to fetch data. Check the item IDs and try again.");
    }
}

function displayData(marketData, taxRate, setupFee) {
    const table = document.getElementById("marketTable");
    table.innerHTML = "<tr><th>Item</th><th>Buy From</th><th>Min Sell</th><th>Sell To</th><th>Max Sell</th><th>Profit</th></tr>";

    marketData.forEach(({ itemId, minCity, minSell, maxCity, maxSell }) => {
        let profit = "N/A";
        
        if (maxSell > minSell && minCity !== maxCity) {
            const sellAfterSetup = maxSell * (1 - setupFee);
            const finalSellPrice = sellAfterSetup * (1 - taxRate);
            profit = (finalSellPrice - minSell).toFixed(2);
        }

        table.innerHTML += `
            <tr>
                <td>${itemId}</td>
                <td>${minCity} (${minSell})</td>
                <td>${minSell}</td>
                <td>${maxCity} (${maxSell})</td>
                <td>${maxSell}</td>
                <td>${profit}</td>
            </tr>
        `;
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const balls = document.getElementById("btn1");

    if (balls) {
        balls.addEventListener("click", fetchMarketData);
    } else {
        console.error("Button with id 'btn1' not found.");
    }
});
