var xhReq = new XMLHttpRequest(); // Create new request using global constructor
xhReq.open('GET', "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd", false); // Initialize request; synchronous
xhReq.send(null); // Send request to server
var data = JSON.parse(xhReq.responseText); // Read only response text

console.log(data[0]);

// Initialization of global variables 
var $list; // Object of the HTML table structure
var cryptocurrencies;   //[ {name:'', symbol:''}, etc...}]
var timerId;
var updateInterval = 30000; // Update invterval will be 30 seconds

// Create decending comparator function to be able to sort the 24hr percentage change
function descending(a, b){return a.percentage_change_24h < b.percentage_change_24h ? 1 : -1;}

// Getting height of each row, and rebuilding each row one by one
function reposition (){     
    var height = $('#cryptocurrencies .cryptocurrency').height();
    var y = height;
    for (var i = 0; i < cryptocurrencies.length; i++){
        cryptocurrencies[i].$item.css("top", y + "px"); // for each cryptocurrency
        y +=height;
    }
}

// Takes cryptocurrency object, assigns new rank in sequenctial order based on table
function updateRanks(cryptocurrencies){
    for (var i = 0; i < cryptocurrencies.length; i++){
        cryptocurrencies[i].$item.find(".rank").text(i + 1);
    }
}

function fetchNewData(data, attributeName, name){
    for (var x in data){
        if (data[x].name == name){
            return data[x][attributeName];
        }
    }
    return null;
}

// Fetch the API data function used after time interval reset
function getNewData(){      // get new data for each coin and change their new values
    var newReq = new XMLHttpRequest();
    newReq.open('GET', "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd", false);
    newReq.send(null);
    var newData = JSON.parse(newReq.responseText);
    // Replace/update cryptocurrency object data
    for (var i = 0; i < cryptocurrencies.length; i++){
        var cryptocurrency = cryptocurrencies[i];
        cryptocurrency.volume_24h = fetchNewData(newData, 'total_volume', cryptocurrency.name);
        cryptocurrency.$item.find(".volume_24h").text(cryptocurrency.volume_24h);
        cryptocurrency.price = fetchNewData(newData, 'current_price', cryptocurrency.name);
        cryptocurrency.$item.find(".price").text(cryptocurrency.price);
        cryptocurrency.percentage_change_24h = fetchNewData(newData, 'market_cap_change_percentage_24h', cryptocurrency.name);
        cryptocurrency.$item.find(".percentage_change_24h").text(cryptocurrency.percentage_change_24h);
    }

    cryptocurrencies.sort(descending)
    updateRanks(cryptocurrencies);
    reposition();
    console.log('Successfully fectched new data')
}

// function to build my table body
function buildTable (){
     // create the HTML table body with each data box matching table headers
     for (let i = 0; i < cryptocurrencies.length; i++){
        $item = $(
            "<tr class='cryptocurrency'>" +
                "<th class='rank'>" +(i+1)+ "</th>" +
                "<td class='name'>" + cryptocurrencies[i].name + "</td>" +
                "<td class='symbol'>" + cryptocurrencies[i].symbol.toUpperCase() + "</td>" +
                "<td class='price'>" + cryptocurrencies[i].price + "</td>" +
                "<td class='market_cap'>" + cryptocurrencies[i].market_cap + "</td>" +
                "<td class='circulating_supply'>" + cryptocurrencies[i].circulating_supply + "</td>" +
                "<td class='volume_24h'>" + cryptocurrencies[i].volume_24h + "</td>" +
                "<td class='percentage_change_24h'>" + cryptocurrencies[i].percentage_change_24h + "</td>" +
            "</tr>"
        );
        cryptocurrencies[i].$item = $item;      // adds new crypto object to list
        $list.append($item);
        }
}

// Create function to reset the board, clear the timer, update rankings, build out the cryptocurrency objects, and call the reposition function
function resetBoard (){
    $list = $("#cryptocurrencies")      // creates cryptocurrency id
    cryptocurrencies = [];      // [ {name:'', symbol:'', etc...}]
    
    $list.find(".cryptocurrency").remove();  // Remove all the HTML table to start with clean slate

    if (timerId !== undefined){
        clearInterval(timerId);
    }
    
    for (let i = 0; i < 10; i++){       // Create array of objects, each w/ details of cryptocurrency  
        cryptocurrencies.push(
            { 
                name: data[i].name,
                symbol: data[i].symbol,
                price: data[i].current_price,
                market_cap: data[i].market_cap,
                circulating_supply: Math.round(data[i].circulating_supply),
                volume_24h: data[i].total_volume,
                percentage_change_24h: data[i].market_cap_change_percentage_24h,
            }
        )
    }

    buildTable();
    cryptocurrencies.sort(descending);
    updateRanks(cryptocurrencies);
    reposition();
    // fetch new data every updateInterval
    timerId = setInterval("getNewData();", updateInterval);
}

// First function called to reset the board, recreating the table
resetBoard();

// Search for specific crypto symbol by entering 3 letter coin sybmol, rebuild row for that one coin
$('#search').on("click", () => {
    let symbolSearch = $('input').val().toUpperCase();
    for (var i = 0; i < 100; i++){
        var coin = data[i].symbol.toUpperCase();
        if (symbolSearch === coin){
            $list.find(".cryptocurrency").remove();
            $item = $(
                "<tr class='cryptocurrency'>" +
                    "<th class='rank'>" +(i+1)+ "</th>" +
                    "<td class='name'>" + data[i].name + "</td>" +
                    "<td class='symbol'>" + data[i].symbol.toUpperCase() + "</td>" +
                    "<td class='price'>" + data[i].current_price + "</td>" +
                    "<td class='market_cap'>" + data[i].market_cap + "</td>" +
                    "<td class='volume_24h'>" + data[i].total_volume + "</td>" +
                    "<td class='circulating_supply'>" + data[i].circulating_supply + "</td>" +
                    "<td class='percentage_change_24h'>" + data[i].price_change_percentage_24h + "</td>" +
                "</tr>"
            );
            $list.append($item);
        }
    }
})

// When user clicks on "Full Crypto Ticker" button, it will reset the board
$('#ticker').on('click', resetBoard);