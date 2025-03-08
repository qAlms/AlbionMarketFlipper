async function fetchMarketData() {
    let itemsInput = document.getElementById("itemInput").value.trim();
    
    // Împărțim itemele introduse pe virgule și înlocuim spațiile cu "_"
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
        
        for (const itemId of items) {
            const url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${locations.join(",")}`;

            console.log(`Fetching data for: ${itemId}`); // Debugging: Afișează itemId

            const response = await fetch(url);
            if (!response.ok) {
                console.error(`HTTP error for ${itemId}. Status: ${response.status}`);
                alert(`⚠️ Failed to fetch data for item: ${itemId}`);
                continue;
            }

            const data = await response.json();
            console.log(`🔍 API Response for ${itemId}:`, data); // Debugging: Afișează răspunsul de la API

            if (data.length === 0) {
                console.warn(`No data found for ${itemId}`);
                continue;
            }

            let cityPrices = [];

            // Salvăm prețurile pentru fiecare oraș
            locations.forEach(city => {
                const cityData = data.filter(d => d.city === city);
                const sellOrders = cityData.filter(d => d.sell_price_min > 0);

                if (sellOrders.length > 0) {
                    const cityMinSell = Math.min(...sellOrders.map(d => d.sell_price_min));
                    cityPrices.push({ city, price: cityMinSell });
                }
            });

            // Calculăm toate flip-urile posibile
            let profitableFlips = [];

            for (let buy of cityPrices) {
                for (let sell of cityPrices) {
                    if (buy.city !== sell.city && sell.price > buy.price) {
                        const sellAfterSetup = sell.price * (1 - setupFee);
                        const finalSellPrice = sellAfterSetup * (1 - taxRate);
                        const profit = (finalSellPrice - buy.price).toFixed(2);

                        profitableFlips.push({
                            itemId,
                            buyCity: buy.city,
                            buyPrice: buy.price,
                            sellCity: sell.city,
                            sellPrice: sell.price,
                            profit
                        });
                    }
                }
            }

            marketData.push(...profitableFlips);
        }

        if (marketData.length === 0) {
            alert("⚠️ No profitable flips found.");
        } else {
            displayData(marketData);
        }

    } catch (error) {
        console.error("❌ Error fetching data:", error);
        alert("⚠️ Failed to fetch data. Check the item IDs and try again.");
    }
}

function displayData(marketData) {
    const table = document.getElementById("marketTable");
    table.innerHTML = "<tr><th>Item</th><th>Buy From</th><th>Buy Price</th><th>Sell To</th><th>Sell Price</th><th>Profit</th></tr>";

    if (marketData.length === 0) {
        table.innerHTML += "<tr><td colspan='6'>No profitable flips available</td></tr>";
    } else {
        marketData.forEach(({ itemId, buyCity, buyPrice, sellCity, sellPrice, profit }) => {
            table.innerHTML += `
                <tr>
                    <td>${itemId}</td>
                    <td>${buyCity}</td>
                    <td>${buyPrice}</td>
                    <td>${sellCity}</td>
                    <td>${sellPrice}</td>
                    <td>${profit}</td>
                </tr>
            `;
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById("btn1");

    if (button) {
        button.addEventListener("click", fetchMarketData);
    } else {
        console.error("Button with id 'btn1' not found.");
    }
});
