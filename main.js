// Things to do (updated on 8/8/2014)
// 1) Figure out the time trial mode mechanics (stopwatch *done*, recording time *done*, how to give out medals for beating developer and designer times, resource resets after each segment, etc.)
// 2) periodCount = 4 --> unhide SDDiv and convert SD into USD (once that's unlocked)
// 3) Fork out the time trial segments for Reddit beta testing
// 4) Adjust military power goal for time trial segment #1
// *** Add tooltips to better explain what upgrades do
// *** Implement save/load feature, and a import/export mechanism
// Use start(), stop(), and reset() to call the stopwatch function
// !!! Testing values implemented to fast-track testing process !!!

var goods = {
    amount: 0.00,
    increment: 0.10,
    stockpile: 0.00,
    previousIncrement: 0.10
};

var silver = {
    amount: 2000.00,
    increment: 0.50,
    // You'll initially get 1 SD per .50 oz. of silver
    rate: 1.00,
    // How much currency you'll get for 1 oz
    worth: 2.00
};

var gold = {
    amount: 1000.00,
    // Gold will be valued as 10x that of silver when first introduced
    increment: 0.05,
    rate: 1.00,
    worth: 20.00
};

// Important for Britain to recoup their military expenses
var taxRate = 0.60;

var population = {
    number: 2500,
    // Those poor suckers
    colonist: { 
        number: 0,
        // Need to make sure players can buy the first colonist for 1 SD; stupid JS float point "precision"
        baseCost: 0.9999999,
        cost: 0.9999999,
        increment: 1,
        rate: 0.05
    },
    // Locked until an authority figure gives the okay
    slave: { 
        number: 0,
        baseCost: 5.00,
        cost: 5.00,
        increment: 10,
        rate: 1.00
    },
    // Locked until the merchant has somewhere important to be
    merchant: { 
        number: 0,
        baseCost: 10.00,
        cost: 10.00,
        increment: 1,
        // 1st rate corresponds to amount of goods traded away
        rate1: 0.00,
        mult1: 1.00,
        // 2nd rate tells you how much money you get
        rate2: 0.00,
        mult2: 1.00
    },
    // Term used for soldiers that fought in the American Revolution
    // Sounds more badass than "soldier"
    // Drafted from population
    minutemen: {
        number: 100,
        costSilver: 12.50,
        costGold: 10.00,
        baseCostCN: 1000,
        costCN: 1000,
        increment: 1,
        power: 1
    }
};

// Not part of overall population since they leave after war ends
var redCoat = {
    number: 2500
};

var currency = {
    // More readily available than the British pound sterling; still hard to come by though
    spanishDollar: { 
        amount: 100000.00,
        total: 0.00, // before the revolution, total = amount --> zero the amount so that #launchShip does not unhide itself automatically
        increment: 0.10
    },
    // Quickly becomes hyperinflated by the end of the American Revolution
    // Decimal system hasn't been implemented yet
    colonialNotes: {
        amount: 1950000,
        total: 1950000, // needed to show CN worth
        increment: 1,
        rate: 0
    }
};

var upgrade = {
    // We are in dire need of more people here in the New World
    ship: { 
        number: 0,
        baseCost: 25.00,
        cost: 25.00,
        level: 0,
        levelCap: 10,
        rate: 1
    },
    // Ports allow for more ships and goods to come in and go out
    port1: {
        cost: 750.00
    },
    port2: {
        cost: 1500.00
    },
    port3: {
        cost: 3000.00
    },
    port4: {
        cost: 6000.00
    },
    port5: {
        cost: 12000.00
    },
    // Yay, I can eat something besides tobacco now!
    marketplace: { 
        cost: 15.00
    },
    // Pass laws and do mostly useless stuff
    government: { 
        // House of Burgesses
        HoB: {
            cost: 50.00
        },
        // First Continental Congress
        FCC: {
            cost: 5000.00
        }
    },
    military: {
        newAmsterdam: {
            cost: 1000.00
        },
        allies: {
            nativeAmerican: {
                number: 0,
                baseCost: 1500.00,
                cost: 1500.00,
                level: 0,
                multiplier: 1
            }
        },
        warShipGB: {
            number: 0,
            baseCost: 2500.00,
            cost: 2500.00,
            level: 0,
            rate: 1
        },
        // Paid in gold
        barracks: {
            cost: 100.00
        }
    },
    currency: {
        colonialNotes: {
            printingPress1: {
                costSilver: 200.00,
                costGold: 100.00
            },
            printingPress2: {
                costSilver: 300.00,
                costGold: 150.00
            },
            printingPress3: {
                costSilver: 400.00,
                costGold: 200.00
            },
            printingPress4: {
                costSilver: 500.00,
                costGold: 250.00
            },
            printingPress5: {
                costSilver: 600.00,
                costGold: 300.00
            }
        }
    }
};

// Though major events will be displayed in the upgrade section, these should be color-coded to show the player that they are not normal upgrades
var event = {
    // French and Indian War
    FIW: {
        costSilver: 100.00,
        costGold: 25.00,
        // Use colonial gold to help fund the war effort
        fundRate: 0.00
    },
    ToP1: {
        costLives: 1500
    },
    // American revolution
    AmRev: {
        weapon: {
            sword: {
                number: 0,
                baseCostCN: 10,
                costCN: 10,
                increment: 1,
                powerBoost: 1,
                costFactor: 1,
                powerMult: 1
            },
            spear: {
                number: 0,
                baseCostCN: 100,
                costCN: 100,
                increment: 1,
                powerBoost: 5,
                costFactor: 1,
                powerMult: 1
            },
            musket: {
                number: 0,
                baseCostCN: 1000,
                costCN: 100,
                increment: 1,
                powerBoost: 10,
                costFactor: 1,
                powerMult: 1
            },
            cannon: {
                number: 0,
                baseCostCN: 10000,
                costCN: 10000,
                increment: 1,
                powerBoost: 2, // multiplier
                costFactor: 1,
                powerMult: 1
            }
        },
        upgrade: {
            lowerCost: {
                sword1: {
                    costCN: 1000,
                    costFactor: 2
                },
                sword2: {
                    costCN: 5000,
                    costFactor: 4
                },
                spear1: {
                    costCN: 10000,
                    costFactor: 2
                },
                spear2: {
                    costCN: 50000,
                    costFactor: 4
                },
                musket1: {
                    costCN: 100000,
                    costFactor: 2
                },
                musket2: {
                    costCN: 500000,
                    costFactor: 4
                },
                cannon1: {
                    costCN: 1000000,
                    costFactor: 2
                },
                cannon2: {
                    costCN: 5000000,
                    costFactor: 4
                }
            },
            morePower: {
                sword1: {
                    costCN: 2000,
                    powerMult: 2
                },
                sword2: {
                    costCN: 10000,
                    powerMult: 4
                },
                sword3: {
                    costCN: 50000,
                    powerMult: 8
                },
                spear1: {
                    costCN: 20000,
                    powerMult: 2
                },
                spear2: {
                    costCN: 100000,
                    powerMult: 4
                },
                spear3: {
                    costCN: 500000,
                    powerMult: 8
                },
                musket1: {
                    costCN: 200000,
                    powerMult: 2
                },
                musket2: {
                    costCN: 1000000,
                    powerMult: 4
                },
                musket3: {
                    costCN: 5000000,
                    powerMult: 8
                },
                cannon1: {
                    costCN: 2000000,
                    powerMult: 2
                },
                cannon2: {
                    costCN: 10000000,
                    powerMult: 4
                },
                cannon3: {
                    costCN: 50000000,
                    powerMult: 8
                }
            }
        }
    }
};

// List of all time periods for gameplay
var timePeriod = [
    {
        title: "A Humble Beginning",
        range: "1565 - 1650",
        // keeps track of the number of objectives still in play for the period
        tracker: [1,1,1]
    },
    {
        title: "Battle for American Colonial Dominance",
        range: "1650 - 1763",
        tracker: [1,1,1]
    },
    {
        title: "War is Too Expensive",
        range: "1763 - 1775",
        tracker: [1,1,1,1,1]
    },
    {
        title: "Biting the Hand that Fed You",
        range: "1775 - 1783",
        tracker: [1,1,1,1,1]
    },
    {
        title: "Taxation WITH Representation",
        range: "1783 - 1801",
        tracker: [1,1,1,1,1]
    }
];

// Objective arrays, for easier editing
var objective = [
    {
        timePeriod: "1565 - 1650",
        goals: [
            "The economy has to start somewhere (10 lbs./sec, 5 SD/sec)",
            "Establish the House of Burgesses",
            "Raise your population to at least 50,000"]
    },
    {
        timePeriod: "1650 - 1763",
        goals: [
            "Have 50 British soldiers seize New Amsterdam",
            "Initiate the final stages of the French and Indian War",
            "Recruit 1,500 British soldiers and end the war by signing the Treaty of Paris"]
    },
    {
        timePeriod: "1763 - 1775",
        goals: [
            "The wrong way to disperse a mob",
            "Hold a delightful Tea Party",
            "Have the First Continental Congress convene",
            "Form an army of 100 soldiers",
            "Prepare war fund of 2 million Continentals"]
    },
    {
        timePeriod: "1775 - 1783",
        goals: [
            "Minutemen debut at Lexington and Concord",
            "Harsh winter at Valley Forge",
            "Declare independence",
            "Decisive battle at Yorktown",
            "No more taxes! Yay!"]
    },
    {
        timePeriod: "1783 - 1801",
        goals: [
            "Quash the farmers' rebellion",
            "Form the First Bank of the United States", // unlocks USD, the final currency (of 3)
            "Ratify the Bill of Rights",
            "Profit from the cotton gin",
            "Move capital to Washington, D.C."]
    }
];

// Used to keep track of which period the player has reached
var periodCount = 0;
function whatPeriod() {
    var sumCounter = 0;
    for (i=0;i<timePeriod[periodCount].tracker.length;i++) {
        sumCounter += timePeriod[periodCount].tracker[i];
    }
    if (sumCounter === 0) {
        periodCount++;
    }
}

function displayObjectives(array) {
    whatPeriod();
    var list = document.getElementById("objective");
    
    for(i=0;i<array.length;i++) {
        var item = document.createElement("li");
        item.appendChild(document.createTextNode(array[i]));
        list.appendChild(item);
    }
    return list;
}
displayObjectives(objective[periodCount].goals);

// Keeps track of which goals are active and which ones are inactive (crossed out)
function checkObjectives() {
    // A Humble Beginning (1565 - 1650)
    if (((population.colonist.number * population.colonist.rate) + ((population.slave.number / population.slave.increment) * population.slave.rate) >= 10) && (population.merchant.rate2 >= 5)) {
        timePeriod[0].tracker[0] = 0;
    }
    if (population.number >= 50000) {
        timePeriod[0].tracker[2] = 0;
    }
    
    // War Is Too Expensive (1763 - 1775)
    if (population.minutemen.number >= 100) {
        timePeriod[2].tracker[3] = 0;
    }
    if (currency.colonialNotes.amount >= 2000000) {
        timePeriod[2].tracker[4] = 0;
    }
}

function checkDisplayObjectives() {
    for (i=0;i<timePeriod[periodCount].tracker.length;i++) {
        if (timePeriod[periodCount].tracker[i] === 0) {
            document.getElementById("objective").getElementsByTagName("li")[i].setAttribute("class", "strikethrough");
        }
    }
}

function removeOldObjectives () {
    for (i=0;i<timePeriod[periodCount - 1].tracker.length;i++) {
        $("li:first").remove();
    }
}

// Keeps track of when upgrades are available
function checkUpgrades() {
    // Unlock marketplace
    if (population.number >= 5) {
        $("#buildMarketplace").removeClass("hidden");
    }
    
    // Allow people to sail to the New World (every second)
    if (currency.spanishDollar.amount >= 5.00) {
        $("#launchShip").removeClass("hidden");
    }
    
    // House of Burgesses is a group of 12 legislators, so population cannot be too small
    if ((population.number >= 25) && (currency.spanishDollar.amount >= 25.00)) {
        $("#foundHoB").removeClass("hidden");
    }
    
    // An effort to keep the early game from becoming a waiting game (2 hours of solid idling is too much!)
    if (population.number >= 2000) {
        $("#jumpStart").removeClass("hidden");
    }
    
    // More ships = more people; ports would then allow for more ships
    if (upgrade.ship.number >= 25) {
        $("#buildPort1").removeClass("hidden");
    }
    
    if (upgrade.ship.number >= 55) {
        $("#buildPort2").removeClass("hidden");
    }
    
    if (upgrade.ship.number >= 90) {
        $("#buildPort3").removeClass("hidden");
    }
    
    if (upgrade.ship.number >= 130) {
        $("#buildPort4").removeClass("hidden");
    }
    
    if (upgrade.ship.number >= 175) {
        $("#buildPort5").removeClass("hidden");
    }
    
    // Great Britain wants more land in North America to claim more gold and secure more wealth
    if ((silver.amount >= 50.00) && (gold.amount >= 50.00)) {
        $("#recruitNative").removeClass("hidden");
        $("#warShipGB").removeClass("hidden");
    }
    
    // Time to invade and take over New Amsterdam
    if (redCoat.number >= 50) {
        $("#newAmsterdam").removeClass("hidden");
    }
    
    // High taxes prompt riots
    if (taxRate >= 0.60) {
        $("#BosMas").removeClass("hidden");
    }
    
    // Different upgrades for printing more colonial notes
    if (currency.colonialNotes.amount >= 100) {
        $("#printingPress1").removeClass("hidden");
    }
    
    if (currency.colonialNotes.amount >= 1000) {
        $("#printingPress2").removeClass("hidden");
    }
    
    if (currency.colonialNotes.amount >= 10000) {
        $("#printingPress3").removeClass("hidden");
    }
    
    if (currency.colonialNotes.amount >= 100000) {
        $("#printingPress4").removeClass("hidden");
    }
    
    // Weapons to boost military power during the American Revolution
    if (event.AmRev.weapon.sword.number >= 10) {
        $("#AmRevSpear").removeClass("hidden");
    }
    
    if (event.AmRev.weapon.spear.number >= 10) {
        $("#AmRevMusket").removeClass("hidden");
    }
    
    if (event.AmRev.weapon.musket.number >= 10) {
        $("#AmRevCannon").removeClass("hidden");
    }
    
    // Upgrades to either lower weapon costs or boost military power
    if (event.AmRev.weapon.cannon.number >= 1) {
        $("#lowerCostSword1").removeClass("hidden");
        $("#lowerCostSpear1").removeClass("hidden");
        $("#lowerCostMusket1").removeClass("hidden");
        $("#lowerCostCannon1").removeClass("hidden");
        $("#morePowerSword1").removeClass("hidden");
        $("#morePowerSpear1").removeClass("hidden");
        $("#morePowerMusket1").removeClass("hidden");
        $("#morePowerCannon1").removeClass("hidden");
    }
}

// Update indicator values
// Add plus sign when indicator value is positive
// Positive numbers are green, negative numbers are red, and zeroes are black
function displayIndicators() {
    // Indicator formulas
    var totalPopInd = upgrade.ship.number * upgrade.ship.rate;
    var redCoatInd = (((population.colonist.number * population.colonist.rate) - event.FIW.fundRate) + (((population.colonist.number * population.colonist.rate) - event.FIW.fundRate) / 10) + (upgrade.military.warShipGB.number * upgrade.military.warShipGB.rate)) * upgrade.military.allies.nativeAmerican.multiplier;
    var SDInd = (population.merchant.rate2 * population.merchant.mult2 * (1 - taxRate));
    var CNInd = currency.colonialNotes.rate;
    var goodsInd0 = (((population.colonist.number * population.colonist.rate) + ((population.slave.number / population.slave.increment) * population.slave.rate)) - (population.merchant.rate1 * population.merchant.mult1));
    var goodsInd1 = (((population.slave.number / population.slave.increment) * population.slave.rate) - (population.merchant.rate1 * population.merchant.mult1));
    var silverInd1 = (population.colonist.number * population.colonist.rate) - event.FIW.fundRate;
    var silverInd2 = population.colonist.number * population.colonist.rate;
    var goldInd1 = (population.colonist.number * population.colonist.rate) - event.FIW.fundRate;
    var goldInd2 = population.colonist.number * population.colonist.rate;
    
    // Population indicators
    if ((totalPopInd > 0) && (periodCount !== 3)) {
        document.getElementById("popInd").innerHTML = "(+" + totalPopInd + ")";
        $("#popInd").removeClass("negative").addClass("positive");
    }
    if (document.getElementById("redCoatDiv") !== null) {
        if (redCoatInd > 0) {
            document.getElementById("redCoatInd").innerHTML = "(+" + numFormat(redCoatInd) + ")";
            $("#redCoatInd").removeClass("negative").addClass("positive");
        }
        else if (redCoatInd < 0) {
            document.getElementById("redCoatInd").innerHTML = "(" + numFormat(redCoatInd) + ")";
            $("#redCoatInd").removeClass("positive").addClass("negative");
        }
        else {
            document.getElementById("redCoatInd").innerHTML = "(" + numFormat(redCoatInd) + ")";
            $("#redCoatInd").removeClass("positive").removeClass("negative");
        }
    }
    
    // Currency indicators
    if (document.getElementById("SDDiv") !== null) {
        if (SDInd > 0) {
            document.getElementById("SDInd").innerHTML = "(+" + numFormat(SDInd) + ")";
            $("#SDInd").removeClass("negative").addClass("positive");
        }
        else if (SDInd < 0) {
            document.getElementById("SDInd").innerHTML = "(" + numFormat(SDInd) + ")";
            $("#SDInd").removeClass("positive").addClass("negative");
        }
        else {
            document.getElementById("SDInd").innerHTML = "(" + numFormat(SDInd) + ")";
            $("#SDInd").removeClass("positive").removeClass("negative");
        }
    }
    
    if (document.getElementById("CNDiv") !== null) {
        if (CNInd > 0) {
            document.getElementById("CNInd").innerHTML = "(+" + CNInd.toLocaleString() + ")";
            $("#CNInd").removeClass("negative").addClass("positive");
        }
        else if (CNInd < 0) {
            document.getElementById("CNInd").innerHTML = "(" + CNInd.toLocaleString() + ")";
            $("#CNInd").removeClass("positive").addClass("negative");
        }
        else {
            document.getElementById("CNInd").innerHTML = "(" + CNInd.toLocaleString() + ")";
            $("#CNInd").removeClass("positive").removeClass("negative");
        }
    }
    
    // Goods indicator
    if (periodCount === 0) {
        if (goodsInd0 > 0) {
            document.getElementById("goodsInd").innerHTML = "(+" + numFormat(goodsInd0) + ")";
            $("#goodsInd").removeClass("negative").addClass("positive");
        }
        else if (goodsInd0 < 0) {
            document.getElementById("goodsInd").innerHTML = "(" + numFormat(goodsInd0) + ")";
            $("#goodsInd").removeClass("positive").addClass("negative");
        }
        else {
            document.getElementById("goodsInd").innerHTML = "(" + numFormat(goodsInd0) + ")";
            $("#goodsInd").removeClass("positive").removeClass("negative");
        }
    }
    else if ((periodCount > 0) && (periodCount !== 3)) {
        if (goodsInd1 > 0) {
            document.getElementById("goodsInd").innerHTML = "(+" + numFormat(goodsInd1) + ")";
            $("#goodsInd").removeClass("negative").addClass("positive");
        }
        else if (goodsInd1 < 0) {
            document.getElementById("goodsInd").innerHTML = "(" + numFormat(goodsInd1) + ")";
            $("#goodsInd").removeClass("positive").addClass("negative");
        }
        else {
            document.getElementById("goodsInd").innerHTML = "(" + numFormat(goodsInd1) + ")";
            $("#goodsInd").removeClass("positive").removeClass("negative");
        }
    }
    
    // Silver indicator
    if (periodCount > 0) {
        if (document.getElementById("FIW") !== null) {
            if (silverInd1 > 0) {
                document.getElementById("silverInd").innerHTML = "(+" + numFormat(silverInd1) + ")";
                $("#silverInd").removeClass("negative").addClass("positive");
            }
            else if (silverInd1 < 0) {
                document.getElementById("silverInd").innerHTML = "(" + numFormat(silverInd1) + ")";
                $("#silverInd").removeClass("positive").addClass("negative");
            }
            else {
                document.getElementById("silverInd").innerHTML = "(" + numFormat(silverInd1) + ")";
                $("#silverInd").removeClass("positive").removeClass("negative");
            }
        }
        else if (periodCount !== 3) {
            if (silverInd2 > 0) {
                document.getElementById("silverInd").innerHTML = "(+" + numFormat(silverInd2) + ")";
                $("#silverInd").removeClass("negative").addClass("positive");
            }
            else if (silverInd2 < 0) {
                document.getElementById("silverInd").innerHTML = "(" + numFormat(silverInd2) + ")";
                $("#silverInd").removeClass("positive").addClass("negative");
            }
            else {
                document.getElementById("silverInd").innerHTML = "(" + numFormat(silverInd2) + ")";
                $("#silverInd").removeClass("positive").removeClass("negative");
            }
        }
    } 
    
    // Gold indicator
    if (periodCount > 0) {
        if (document.getElementById("FIW") !== null) {
            if (goldInd1 > 0) {
                document.getElementById("goldInd").innerHTML = "(+" + numFormat(goldInd1) + ")";
                $("#goldInd").removeClass("negative").addClass("positive");
            }
            else if (goldInd1 < 0) {
                document.getElementById("goldInd").innerHTML = "(" + numFormat(goldInd1) + ")";
                $("#goldInd").removeClass("positive").addClass("negative");
            }
            else {
                document.getElementById("goldInd").innerHTML = "(" + numFormat(goldInd1) + ")";
                $("#goldInd").removeClass("positive").removeClass("negative");
            }
        }
        else if (periodCount !== 3) {
            if (goldInd2 > 0) {
                document.getElementById("goldInd").innerHTML = "(+" + numFormat(goldInd2) + ")";
                $("#goldInd").removeClass("negative").addClass("positive");
            }
            else if (goldInd2 < 0) {
                document.getElementById("goldInd").innerHTML = "(" + numFormat(goldInd2) + ")";
                $("#goldInd").removeClass("positive").addClass("negative");
            }
            else {
                document.getElementById("goldInd").innerHTML = "(" + numFormat(goldInd2) + ")";
                $("#goldInd").removeClass("positive").removeClass("negative");
            }
        }
    }
}

// Update button text; in the future, images will change
var transitionToggle = 1;
function periodTransition() {
    // Have to have tea to have a Tea Party
    if ((periodCount === 1) && (transitionToggle === 1)) {
        $("#getGoods").text("Harvest Tea");
        $("#sellGoods").text("Sell Tea");
        
        // Allow players a big boost in income at the start of each time period
        $("#sellAll").removeClass("hidden");
        $("#goodsStockpile").removeClass("hidden");
        goods.stockpile = goods.amount;
        goods.amount -= goods.stockpile;
        goods.previousIncrement = goods.increment;
        // Increase clicking power
        goods.increment = 1.00;
        // Increase currency-to-goods ratio from 1:1 to 2:1
        currency.spanishDollar.increment = 2.00;
        // To double slave efficiency when increment is doubled, rate must be quadrupled
        population.slave.increment = 20;
        population.slave.rate = 4.00;
        upgrade.ship.levelCap = 50;
        // Now that colonists can mine, they should cost more
        population.colonist.baseCost *= 10;
        // Higher demand for slaves
        population.slave.baseCost *= 5;
        
        // Players can now mine both silver and gold, which can then be sold for the featured currency of the period
        $("#silver").removeClass("hidden");
        $("#gold").removeClass("hidden");
        
        // With the discovery of gold, Britain sends soldiers to the colonies to safeguard their newfound wealth
        $("#redCoatDiv").removeClass("hidden");
        
        // Updates objective display (may need to implement a more elegant method later on)        
        removeOldObjectives();
        displayObjectives(objective[periodCount].goals);
        transitionToggle = 0;
    }
    
    if ((periodCount === 2) && (transitionToggle === 0)) {
        $("#sellAll").removeClass("hidden");
        $("#goodsStockpile").removeClass("hidden");
        goods.stockpile = goods.amount;
        goods.amount -= goods.stockpile;
        goods.previousIncrement = goods.increment;
        upgrade.ship.levelCap = 200;
        // Increase selling ratio from 2 to 2.25 (after a ~60% tax)
        currency.spanishDollar.increment = 5.75;
        
        // Now that war is over, soldiers and allies can go home
        $(".temp1").remove();

        // Impose a tax (initially a 20% reduction in revenue, which will grow to 80%)
        $("#taxRate").removeClass("hidden");
        taxRate = 0.20;
        // Tax rate will increase a percentage point every 10 seconds until it hits 60
        taxHike();
        
        removeOldObjectives();
        displayObjectives(objective[periodCount].goals);
        transitionToggle = 1;
    }
    
    if ((periodCount === 3) && (transitionToggle === 1)) {
        // Automatically convert all unsold goods into stockpiled goods and immediately sell it
        goods.stockpile = goods.amount;
        goods.amount -= goods.stockpile;
        goods.amount = 0;
        goods.previousIncrement = goods.increment;
        currency.spanishDollar.amount += (goods.stockpile / goods.previousIncrement) * currency.spanishDollar.increment * (1 - taxRate);
        currency.spanishDollar.total = currency.spanishDollar.amount;
        currency.spanishDollar.amount = 0;
        
        // Switch to new currency; British tax rate no longer applies
        $(".temp2").remove();
        
        // Hide all unnecessary resources until the revolution is over
        $("#goods").addClass("hidden");
        $("#silver").addClass("hidden");
        $("#gold").addClass("hidden");
        $("#colonist").addClass("hidden");
        $("#slave").addClass("hidden");
        $("#merchant").addClass("hidden");
        $("#SDDiv").addClass("hidden"); // will need to unhide and convert to USD in periodCount 4
        $("#launchShip").addClass("hidden"); // will need to convert prices to USD
        
        // Unhide the timer for American Revolution
        $("#timeTrial").removeClass("hidden");
        // Unhide the first weapon upgrade
        $("#AmRevSword").removeClass("hidden");
        
        // Soldiers are now paid in Continentals instead of gold and silver
        $("#costSilverMinutemen").remove();
        $("#costGoldMinutemen").remove();
        $("#costCNMinutemen").removeClass("hidden");
        
        // Turn off all auto-clickers for the moment
        // autoSwitch = 0;
        
        // Everyone starts with 2 million Continentals, no more, no less
        currency.colonialNotes.amount = 2000000;
        
        // May need to revise if time trial mode changes
        removeOldObjectives();
        displayObjectives(objective[periodCount].goals);
        transitionToggle = 0;
    }
}

/////////////////// Stopwatch (for Time Trial Mode) ///////////////////
///// Original code from https://gist.github.com/electricg/4372563 /////
var	clsStopwatch = function() {
		// Private vars
		var	startAt	= 0;	// Time of last start / resume. (0 if not running)
		var	lapTime	= 0;	// Time on the clock when last stopped in milliseconds

		var	now	= function() {
				return (new Date()).getTime(); 
			}; 
 
		// Public methods
		// Start or resume
		this.start = function() {
				startAt	= startAt ? startAt : now();
			};

		// Stop or pause
		this.stop = function() {
				// If running, update elapsed time otherwise keep it
				lapTime	= startAt ? lapTime + now() - startAt : lapTime;
				startAt	= 0; // Paused
			};

		// Reset
		this.reset = function() {
				lapTime = startAt = 0;
			};

		// Duration
		this.time = function() {
				return lapTime + (startAt ? now() - startAt : 0); 
			};
	};

var timeTrial = new clsStopwatch();
var clocktimer;

function pad(num, size) {
	var s = "0000" + num;
	return s.substr(s.length - size);
}

function formatTime(time) {
	var hr = 0;
    var min = 0;
    var sec = 0;
    var ms = 0;
    var newTime = '';

	hr = Math.floor( time / (60 * 60 * 1000) );
	time = time % (60 * 60 * 1000);
	min = Math.floor( time / (60 * 1000) );
	time = time % (60 * 1000);
	sec = Math.floor( time / 1000 );
	ms = time % 1000;

	newTime = pad(hr, 2) + ':' + pad(min, 2) + ':' + pad(sec, 2) + ':' + pad(ms, 3);
	return newTime;
}

function start() {
	clocktimer = setInterval(updateValues, 1);
	timeTrial.start();
}

function stop() {
	timeTrial.stop();
	clearInterval(clocktimer);
}

function reset() {
	stop();
	timeTrial.reset();
	update();
}

// Original code written by flavian
// Found here: http://stackoverflow.com/questions/13162186/javascript-add-thousand-seperator-and-retain-decimal-place
function numFormat(n, sep, decimals) {
    sep = sep || "."; // Default to period as decimal separator
    decimals = decimals || 2; // Default to 2 decimals

    return n.toLocaleString().split(sep)[0] + sep + n.toFixed(decimals).split(sep)[1];
}

function updateValues() {
    // Resource variables (goods, money, and people)
    document.getElementById("totalGoods").innerHTML = numFormat(goods.amount) + " lbs.";
    document.getElementById("goodsConversion").innerHTML = goods.increment + " lbs. = " +  numFormat(currency.spanishDollar.increment * (1 - taxRate)) + " SD";
    document.getElementById("goodsStockpile").innerHTML = numFormat(goods.stockpile) + " lbs.";
    document.getElementById("totalSilver").innerHTML = numFormat(silver.amount) + " oz.";
    document.getElementById("silverConversion").innerHTML = "1 oz. = " + silver.worth + " SD";
    document.getElementById("totalGold").innerHTML = numFormat(gold.amount) + " oz.";
    document.getElementById("goldConversion").innerHTML = "1 oz. = " + gold.worth + " SD";
    document.getElementById("totalSD").innerHTML = numFormat(currency.spanishDollar.amount) + " Spanish Dollars (SD)";
    if (document.getElementById("CNDiv") !== null) {
        document.getElementById("totalCN").innerHTML = currency.colonialNotes.amount.toLocaleString() + " Continentals (CN)";
        document.getElementById("incrementCN").innerHTML = currency.colonialNotes.increment.toLocaleString() + " CN per click";
    }
    document.getElementById("population").innerHTML = "Population: " + population.number.toLocaleString();
    
    // Tax variable
    if (document.getElementById("taxRate") !== null) {
        document.getElementById("taxRate").innerHTML = "British Tax Rate: " + (taxRate * 100).toFixed(0) + "%";
    }
    
    // Colonist variables
    document.getElementById("numColonist").innerHTML = "You have: " + population.colonist.number.toLocaleString();
    document.getElementById("costColonist").innerHTML = "Cost: " + numFormat(population.colonist.cost) + " SD";
    // Colonists switch from harvesters to miners after the first time period
    if (periodCount === 0) {
        document.getElementById("rateColonist").innerHTML = numFormat(population.colonist.number * population.colonist.rate) + " lbs./sec";
    } else if (periodCount > 0) {
        document.getElementById("rateColonist").innerHTML = numFormat(population.colonist.number * population.colonist.rate) + " oz./sec";
    }
    
    // Slave variables
    document.getElementById("numSlave").innerHTML = "You have: " + population.slave.number.toLocaleString();
    document.getElementById("costSlave").innerHTML = "Cost: " + numFormat(population.slave.cost) + " SD";
    document.getElementById("rateSlave").innerHTML = numFormat((population.slave.number/population.slave.increment) * population.slave.rate) + " lbs./sec";
    
    // Merchant variables
    document.getElementById("numMerchant").innerHTML = "You have: " + population.merchant.number.toLocaleString();
    document.getElementById("costMerchant").innerHTML = "Cost: " +  numFormat(population.merchant.cost) + " SD";
    document.getElementById("rateMerchant").innerHTML = numFormat(population.merchant.rate1 * population.merchant.mult1) + " lbs. --> " + numFormat(population.merchant.rate2 * population.merchant.mult2 * (1 - taxRate)) + " SD (per second)";
    
    // British soldier variable
    if (document.getElementById("numRedCoat") !== null) {
        document.getElementById("numRedCoat").innerHTML = "# of British soldiers: " + Math.floor(redCoat.number).toLocaleString();
    }
    
    // Ship variables
    document.getElementById("levelShip").innerHTML = "Level: " + upgrade.ship.level + "/" + upgrade.ship.levelCap;
    document.getElementById("costShip").innerHTML = "Cost: " + numFormat(upgrade.ship.cost) + " SD";
    document.getElementById("rateShip").innerHTML = (upgrade.ship.number * upgrade.ship.rate) + " people/sec";
    
    // Native American ally variables
    if (document.getElementById("levelNative") !== null) {
        document.getElementById("levelNative").innerHTML = "Level: " + upgrade.military.allies.nativeAmerican.level;
        document.getElementById("costNative").innerHTML = "Cost: " + numFormat(upgrade.military.allies.nativeAmerican.cost) + " SD";
        document.getElementById("multiplierNative").innerHTML = "Multiplier: " + numFormat(upgrade.military.allies.nativeAmerican.multiplier);
    }
    
    // British war ship variables
    if (document.getElementById("levelWarShipGB") !== null) {
        document.getElementById("levelWarShipGB").innerHTML = "Level: " + upgrade.military.warShipGB.level;
        document.getElementById("costWarShipGB").innerHTML = "Cost: " + numFormat(upgrade.military.warShipGB.cost) + " SD";
        document.getElementById("rateWarShipGB").innerHTML = (upgrade.military.warShipGB.number * upgrade.military.warShipGB.rate) + " soldiers/sec";
    }
    
    // Minutemen variables
    if (document.getElementById("minutemen") !== null) {
        document.getElementById("numMinutemen").innerHTML = "You have: " + population.minutemen.number.toLocaleString();
        document.getElementById("costCNMinutemen").innerHTML = population.minutemen.costCN.toLocaleString() + " CN";
    }
    
    // American Revolution indicators
    if (document.getElementById("worthCN") !== null) {
        document.getElementById("worthCN").innerHTML = "1 CN is now worth " + (2000000 / currency.colonialNotes.total).toFixed(4) + " CN";
    }
    if (document.getElementById("powerDisplay") !== null) {
        if (event.AmRev.weapon.cannon.number === 0) {
            document.getElementById("powerDisplay").innerHTML = ((population.minutemen.power * population.minutemen.number) + (event.AmRev.weapon.sword.number * event.AmRev.weapon.sword.powerBoost * event.AmRev.weapon.sword.powerMult) + (event.AmRev.weapon.spear.number * event.AmRev.weapon.spear.powerBoost * event.AmRev.weapon.spear.powerMult) + (event.AmRev.weapon.musket.number * event.AmRev.weapon.musket.powerBoost * event.AmRev.weapon.musket.powerMult)).toLocaleString() + " military power";
        }
        else {
            document.getElementById("powerDisplay").innerHTML = (((population.minutemen.power * population.minutemen.number) + (event.AmRev.weapon.sword.number * event.AmRev.weapon.sword.powerBoost * event.AmRev.weapon.sword.powerMult) + (event.AmRev.weapon.spear.number * event.AmRev.weapon.spear.powerBoost * event.AmRev.weapon.spear.powerMult) + (event.AmRev.weapon.musket.number * event.AmRev.weapon.musket.powerBoost * event.AmRev.weapon.musket.powerMult)) * (event.AmRev.weapon.cannon.number * event.AmRev.weapon.cannon.powerBoost * event.AmRev.weapon.cannon.powerMult)).toLocaleString() + " military power";
        }
    }
    if (document.getElementById("AmRevSword") !== null) {
        document.getElementById("powerAmRevSword").innerHTML = "(+" + (event.AmRev.weapon.sword.powerBoost * event.AmRev.weapon.sword.powerMult) + " power)";
        document.getElementById("numAmRevSword").innerHTML = "You have: " + event.AmRev.weapon.sword.number;
        document.getElementById("costAmRevSword").innerHTML = "Cost: " + event.AmRev.weapon.sword.costCN.toLocaleString() + " CN";
    }
    if (document.getElementById("AmRevSpear") !== null) {
        document.getElementById("powerAmRevSpear").innerHTML = "(+" + (event.AmRev.weapon.spear.powerBoost * event.AmRev.weapon.spear.powerMult) + " power)";
        document.getElementById("numAmRevSpear").innerHTML = "You have: " + event.AmRev.weapon.spear.number;
        document.getElementById("costAmRevSpear").innerHTML = "Cost: " + event.AmRev.weapon.spear.costCN.toLocaleString() + " CN";
    }
    if (document.getElementById("AmRevMusket") !== null) {
        document.getElementById("powerAmRevMusket").innerHTML = "(+" + (event.AmRev.weapon.musket.powerBoost * event.AmRev.weapon.musket.powerMult) + " power)";
        document.getElementById("numAmRevMusket").innerHTML = "You have: " + event.AmRev.weapon.musket.number;
        document.getElementById("costAmRevMusket").innerHTML = "Cost: " + event.AmRev.weapon.musket.costCN.toLocaleString() + " CN";
    }
    if (document.getElementById("AmRevCannon") !== null) {
        document.getElementById("powerAmRevCannon").innerHTML = "(x" + (event.AmRev.weapon.cannon.powerBoost * event.AmRev.weapon.cannon.powerMult) + " power)";
        document.getElementById("numAmRevCannon").innerHTML = "You have: " + event.AmRev.weapon.cannon.number;
        document.getElementById("costAmRevCannon").innerHTML = "Cost: " + event.AmRev.weapon.cannon.costCN.toLocaleString() + " CN";
    }
       
    // Time period title and range information
    document.getElementById("timePeriodTitle").innerHTML = timePeriod[periodCount].title;
    document.getElementById("timePeriodRange").innerHTML = timePeriod[periodCount].range;
       
    // Have indicators reflect real-time changes
    if (autoSwitch === 1) {
        displayIndicators();
    }
    
    // Actively check which objectives have been completed and strike out ones that have been completed
    checkObjectives();
    checkDisplayObjectives();
    
    // Time Trial timer
    document.getElementById("timeDisplay").innerHTML = "Time: " + formatTime(timeTrial.time());
    
    // To make sure upgrades unlock when they're supposed to
    checkUpgrades();
    
    // Keep a running tab on which time period it is
    whatPeriod();
    
    // Images, layouts, and various calculations change when moving to the next time period
    periodTransition();
    
    //console.log(event.AmRev.weapon.sword.costCN);
    //console.log(currency.spanishDollar.total);
}

/////////////////// Clicking events ///////////////////
$("#getGoods").click(function () {
    goods.amount += goods.increment;
    updateValues();
});

$("#sellGoods").click(function () {
    if (goods.amount >= goods.increment) {
        goods.amount -= goods.increment;
        currency.spanishDollar.amount += currency.spanishDollar.increment * (1 - taxRate);
        updateValues();
    }
});

$("#getSilver").click(function() {
    silver.amount += silver.increment;
    redCoat.number += ((silver.increment / 10) * upgrade.military.allies.nativeAmerican.multiplier);
    updateValues();
});

$("#sellSilver").click(function() {
    if (silver.amount >= silver.increment) {
        silver.amount -= silver.increment;
        redCoat.number -= ((silver.increment / 10) * upgrade.military.allies.nativeAmerican.multiplier);
        currency.spanishDollar.amount += silver.rate * (1 - taxRate);
        updateValues();
    }
});

$("#getGold").click(function() {
    gold.amount += gold.increment;
    redCoat.number += gold.increment * upgrade.military.allies.nativeAmerican.multiplier;
    updateValues();
});

$("#sellGold").click(function() {
    if (gold.amount >= gold.increment) {
        gold.amount -= gold.increment;
        redCoat.number -= gold.increment * upgrade.military.allies.nativeAmerican.multiplier;
        currency.spanishDollar.amount += gold.rate * (1 - taxRate);
        updateValues();
    }
});

$("#getColonists").click(function() {
    if (currency.spanishDollar.amount >= (population.colonist.cost)) {
        currency.spanishDollar.amount -= (population.colonist.cost);
        population.colonist.number += population.colonist.increment;
        population.number += population.colonist.increment;
        population.colonist.cost = population.colonist.baseCost * Math.pow(1.05,population.colonist.number);
        calcPerSec();
        updateValues();
    }
});

$("#buySlaves").click(function() {
    if (currency.spanishDollar.amount >= population.slave.cost) {
        currency.spanishDollar.amount -= population.slave.cost;
        population.slave.number += population.slave.increment;
        population.number += population.slave.increment;
        population.slave.cost = population.slave.baseCost * Math.pow(1.10,(population.slave.number/population.slave.increment));
        calcPerSec();
        updateValues();
    }
});

$("#hireMerchants").click(function() {
    if (currency.spanishDollar.amount >= population.merchant.cost) {
        currency.spanishDollar.amount -= population.merchant.cost;
        population.merchant.number += population.merchant.increment;
        population.number += population.merchant.increment;
        population.merchant.cost = population.merchant.baseCost * Math.pow(1.06,population.merchant.number);
        // Linear rate increase
        population.merchant.rate1 += 0.10;
        // They're good at what they do
        population.merchant.rate2 += 0.50;
        calcPerSec();
        updateValues();
    }
});

$("#launchShip").click(function() {
    if ((currency.spanishDollar.amount >= upgrade.ship.cost) && (upgrade.ship.level < upgrade.ship.levelCap)) {
        currency.spanishDollar.amount -= upgrade.ship.cost;
        upgrade.ship.level++;
        upgrade.ship.number++;
        upgrade.ship.cost = upgrade.ship.baseCost * Math.pow(1.10,upgrade.ship.level);
        calcPerSec();
        updateValues();
    }
});

$("#recruitNative").click(function() {
    if (currency.spanishDollar.amount >= upgrade.military.allies.nativeAmerican.cost) {
        currency.spanishDollar.amount -= upgrade.military.allies.nativeAmerican.cost;
        upgrade.military.allies.nativeAmerican.level++;
        upgrade.military.allies.nativeAmerican.number++;
        upgrade.military.allies.nativeAmerican.multiplier += 0.25;
        upgrade.military.allies.nativeAmerican.cost = upgrade.military.allies.nativeAmerican.baseCost * Math.pow(1.50, upgrade.military.allies.nativeAmerican.level);
        calcPerSec();
        updateValues();
    }
});

$("#warShipGB").click(function() {
    if (currency.spanishDollar.amount >= upgrade.military.warShipGB.cost) {
        currency.spanishDollar.amount -= upgrade.military.warShipGB.cost;
        upgrade.military.warShipGB.level++;
        upgrade.military.warShipGB.number++;
        upgrade.military.warShipGB.cost = upgrade.military.warShipGB.baseCost * Math.pow(1.10, upgrade.military.warShipGB.level);
        calcPerSec();
        updateValues();
    }
});

$("#printCN").click(function() {
    currency.colonialNotes.amount += currency.colonialNotes.increment;
    currency.colonialNotes.total += currency.colonialNotes.increment;
    updateValues();
});

$("#draftMinutemen").click(function() {
    if (periodCount === 2) {
        if ((silver.amount >= population.minutemen.costSilver) && (gold.amount >= population.minutemen.costGold)) {
            silver.amount -= population.minutemen.costSilver;
            gold.amount -= population.minutemen.costGold;
            population.minutemen.number++;
            // Cost won't go up until CN is introduced as the primary way to draft soldiers
            updateValues();
        }
    }
    if (periodCount === 3) {
        if (currency.colonialNotes.amount >= population.minutemen.costCN) {
            currency.colonialNotes.amount -= population.minutemen.costCN;
            population.minutemen.number++;
            population.minutemen.costCN = Math.floor(population.minutemen.baseCostCN * Math.pow(1.25, (population.minutemen.number - 100)));
            updateValues();
        }
    }
});

$("#AmRevSword").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.weapon.sword.costCN) {
        currency.colonialNotes.amount -= event.AmRev.weapon.sword.costCN;
        event.AmRev.weapon.sword.number++;
        event.AmRev.weapon.sword.costCN = Math.floor(event.AmRev.weapon.sword.baseCostCN * Math.pow(1.25, event.AmRev.weapon.sword.number) / event.AmRev.weapon.sword.costFactor);
        updateValues();
    }
});

$("#AmRevSpear").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.weapon.spear.costCN) {
        currency.colonialNotes.amount -= event.AmRev.weapon.spear.costCN;
        event.AmRev.weapon.spear.number++;
        event.AmRev.weapon.spear.costCN = Math.floor(event.AmRev.weapon.spear.baseCostCN * Math.pow(1.25, event.AmRev.weapon.spear.number) / event.AmRev.weapon.spear.costFactor);
        updateValues();
    }
});

$("#AmRevMusket").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.weapon.musket.costCN) {
        currency.colonialNotes.amount -= event.AmRev.weapon.musket.costCN;
        event.AmRev.weapon.musket.number++;
        event.AmRev.weapon.musket.costCN = Math.floor(event.AmRev.weapon.musket.baseCostCN * Math.pow(1.25, event.AmRev.weapon.musket.number) / event.AmRev.weapon.musket.costFactor);
        updateValues();
    }
});

$("#AmRevCannon").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.weapon.cannon.costCN) {
        currency.colonialNotes.amount -= event.AmRev.weapon.cannon.costCN;
        event.AmRev.weapon.cannon.number++;
        event.AmRev.weapon.cannon.costCN = Math.floor(event.AmRev.weapon.cannon.baseCostCN * Math.pow(1.50, event.AmRev.weapon.cannon.number) / event.AmRev.weapon.cannon.costFactor);
        updateValues();
    }
});

/////////////////// One-time (not per second) Clicking events ///////////////////
$("#buildMarketplace").click(function() {
    if (currency.spanishDollar.amount >= upgrade.marketplace.cost) {
        currency.spanishDollar.amount -= upgrade.marketplace.cost;
        $("#buildMarketplace").remove();
        
        // Unlock merchants, which automatically convert goods into usable money
        $("#merchant").removeClass("hidden");
    }
});

$("#foundHoB").click(function() {
    if (currency.spanishDollar.amount >= upgrade.government.HoB.cost) {
        currency.spanishDollar.amount -= upgrade.government.HoB.cost;
        timePeriod[0].tracker[1] = 0;
        $("#foundHoB").remove();
        
        // Unlock slaves, who vastly boost population numbers and goods production
        $("#slave").removeClass("hidden");
    }
});

$("#jumpStart").click(function() {
    population.number += 47500;
    $("#jumpStart").remove();
});

$("#buildPort1").click(function() {
    if (currency.spanishDollar.amount >= upgrade.port1.cost) {
        currency.spanishDollar.amount -= upgrade.port1.cost;
        // Sell bigger quantities but also make more money
        population.merchant.mult1 = 10.00;
        population.merchant.mult2 = 15.00;
        // Ports allow for bigger ships, which would bring in more people
        upgrade.ship.rate = 5;
        $("#buildPort1").remove();
    }
});

$("#buildPort2").click(function() {
    if (currency.spanishDollar.amount >= upgrade.port2.cost) {
        currency.spanishDollar.amount -= upgrade.port2.cost;
        upgrade.ship.rate = 10;
        $("#buildPort2").remove();
    }
});

$("#buildPort3").click(function() {
    if (currency.spanishDollar.amount >= upgrade.port3.cost) {
        currency.spanishDollar.amount -= upgrade.port3.cost;
        population.merchant.mult1 = 15.00;
        population.merchant.mult2 = 22.50;
        upgrade.ship.rate = 15;
        $("#buildPort3").remove();
    }
});

$("#buildPort4").click(function() {
    if (currency.spanishDollar.amount >= upgrade.port4.cost) {
        currency.spanishDollar.amount -= upgrade.port4.cost;
        population.merchant.mult1 = 20.00;
        population.merchant.mult2 = 40.00;
        $("#buildPort4").remove();
    }
});

$("#buildPort5").click(function() {
    if (currency.spanishDollar.amount >= upgrade.port5.cost) {
        currency.spanishDollar.amount -= upgrade.port5.cost;
        population.merchant.mult1 = 25.00;
        population.merchant.mult2 = 50.00;
        upgrade.ship.rate = 20;
        $("#buildPort5").remove();
    }
});

$("#newAmsterdam").click(function() {
    if (currency.spanishDollar.amount >= upgrade.military.newAmsterdam.cost) {
        currency.spanishDollar.amount -= upgrade.military.newAmsterdam.cost;
        // Some casualties from the territorial dispute
        document.getElementById("newAmsterdam").style.backgroundColor = "#960018";
        $("#newAmsterdam").text("-5 Redcoats");
        setTimeout(function() {
            document.getElementById("newAmsterdam").style.backgroundColor = "#458B00";
            $("#newAmsterdam").text("+5,000 population");
        }, 2*1000);
        redCoat.number -= 5;
        population.number += 5000;
        $("#FIW").removeClass("hidden");
        setTimeout(function() {
            timePeriod[1].tracker[0] = 0;
            $("#newAmsterdam").remove();
        }, 4*1000);
    }
});

$("#ToP1").click(function() {
    if (redCoat.number >= event.ToP1.costLives) {
        document.getElementById("ToP1").style.backgroundColor = "#458B00";
        $("#ToP1").text("+80,000 population");
        redCoat.number = 0;
        // French territories are now under British control
        population.number += 80000;
        setTimeout(function() {
            timePeriod[1].tracker[2] = 0;
            $("#FIW").remove();
            $("#ToP1").remove();
        }, 2*1000);
    }
});

$("#BosMas").click(function() {
    document.getElementById("BosMas").style.backgroundColor = "#960018";
    $("#BosMas").text("-5 Bostonians");
    population.number -= 5;
    timePeriod[2].tracker[0] = 0;
    setTimeout(function() {
        $("#BosMas").remove();
        $("#BTP").removeClass("hidden");
    }, 2*1000);
});

$("#BTP").click(function() {
    document.getElementById("BTP").style.backgroundColor = "#458B00";
    $("#BTP").text("Take that, Great Britain!");
    timePeriod[2].tracker[1] = 0;
    setTimeout(function () {
        document.getElementById("BTP").style.backgroundColor = "#960018";
        $("#BTP").text("Tax is now 80%");
        taxRate = 0.80;
    }, 2*1000);
    setTimeout(function() {
        $("#FCC").removeClass("hidden");
        $("#BTP").remove();
    }, 4*1000);
});

$("#FCC").click(function() {
    if (currency.spanishDollar.amount >= upgrade.government.FCC.cost) {
        currency.spanishDollar.amount -= upgrade.government.FCC.cost;
    // Create a mini-conversation here (maybe?)
    // "Taxes are too high"
    // "Taxation without representation -- heehee, that rhymes"
    // "What should we do?"
    // "The only thing we can do"
    // "Be a man, and keep paying taxes because the British repelled the invading French, Dutch, and Spanish troops and kept us safe during the French and Indian War, and we owe them a solid?"
    // "What? No, you're crazy!"
    // "Now, wait a min-"
    // "Gentlemen, prepare for war!"
        timePeriod[2].tracker[2] = 0;
        $("#buildBarracks").removeClass("hidden");
        $("#CNDiv").removeClass("hidden");
        $("#colonialNotes").removeClass("hidden");
        $("#FCC").remove();
    }
});

$("#buildBarracks").click(function() {
    if (gold.amount >= upgrade.military.barracks.cost) {
        gold.amount -= upgrade.military.barracks.cost;
        $("#minutemen").removeClass("hidden");
        $("#buildBarracks").remove();
    }
});

$("#printingPress1").click(function() {
    if ((silver.amount >= upgrade.currency.colonialNotes.printingPress1.costSilver) && (gold.amount >= upgrade.currency.colonialNotes.printingPress1.costGold)) {
        silver.amount -= upgrade.currency.colonialNotes.printingPress1.costSilver;
        gold.amount -= upgrade.currency.colonialNotes.printingPress1.costGold;
        currency.colonialNotes.increment = 10;
        currency.colonialNotes.rate = 1;
        $("#printingPress1").remove();
    }
});

$("#printingPress2").click(function() {
    if ((silver.amount >= upgrade.currency.colonialNotes.printingPress2.costSilver) && (gold.amount >= upgrade.currency.colonialNotes.printingPress2.costGold)) {
        silver.amount -= upgrade.currency.colonialNotes.printingPress2.costSilver;
        gold.amount -= upgrade.currency.colonialNotes.printingPress2.costGold;
        currency.colonialNotes.increment = 100;
        currency.colonialNotes.rate = 10;
        $("#printingPress2").remove();
    }
});

$("#printingPress3").click(function() {
    if ((silver.amount >= upgrade.currency.colonialNotes.printingPress3.costSilver) && (gold.amount >= upgrade.currency.colonialNotes.printingPress3.costGold)) {
        silver.amount -= upgrade.currency.colonialNotes.printingPress3.costSilver;
        gold.amount -= upgrade.currency.colonialNotes.printingPress3.costGold;
        currency.colonialNotes.increment = 1000;
        currency.colonialNotes.rate = 100;
        $("#printingPress3").remove();
    }
});

$("#printingPress4").click(function() {
    if ((silver.amount >= upgrade.currency.colonialNotes.printingPress4.costSilver) && (gold.amount >= upgrade.currency.colonialNotes.printingPress4.costGold)) {
        silver.amount -= upgrade.currency.colonialNotes.printingPress4.costSilver;
        gold.amount -= upgrade.currency.colonialNotes.printingPress4.costGold;
        currency.colonialNotes.increment = 10000;
        currency.colonialNotes.rate = 1000;
        $("#printingPress4").remove();
    }
});

$("#lowerCostSword1").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.lowerCost.sword1.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.lowerCost.sword1.costCN;
        event.AmRev.weapon.sword.costFactor = event.AmRev.upgrade.lowerCost.sword1.costFactor;
        $("#lowerCostSword2").removeClass("hidden");
        $("#lowerCostSword1").remove();
    }
});

$("#lowerCostSword2").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.lowerCost.sword2.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.lowerCost.sword2.costCN;
        event.AmRev.weapon.sword.costFactor = event.AmRev.upgrade.lowerCost.sword2.costFactor;
        $("#lowerCostSword2").remove();
    }
});

$("#lowerCostSpear1").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.lowerCost.spear1.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.lowerCost.spear1.costCN;
        event.AmRev.weapon.spear.costFactor = event.AmRev.upgrade.lowerCost.spear1.costFactor;
        $("#lowerCostSpear2").removeClass("hidden");
        $("#lowerCostSpear1").remove();
    }
});

$("#lowerCostSpear2").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.lowerCost.spear2.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.lowerCost.spear2.costCN;
        event.AmRev.weapon.spear.costFactor = event.AmRev.upgrade.lowerCost.spear2.costFactor;
        $("#lowerCostSpear2").remove();
    }
});

$("#lowerCostMusket1").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.lowerCost.musket1.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.lowerCost.musket1.costCN;
        event.AmRev.weapon.musket.costFactor = event.AmRev.upgrade.lowerCost.musket1.costFactor;
        $("#lowerCostMusket2").removeClass("hidden");
        $("#lowerCostMusket1").remove();
    }
});

$("#lowerCostMusket2").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.lowerCost.musket2.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.lowerCost.musket2.costCN;
        event.AmRev.weapon.musket.costFactor = event.AmRev.upgrade.lowerCost.musket2.costFactor;
        $("#lowerCostMusket2").remove();
    }
});

$("#lowerCostCannon1").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.lowerCost.cannon1.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.lowerCost.cannon1.costCN;
        event.AmRev.weapon.cannon.costFactor = event.AmRev.upgrade.lowerCost.cannon1.costFactor;
        $("#lowerCostCannon2").removeClass("hidden");
        $("#lowerCostCannon1").remove();
    }
});

$("#lowerCostCannon2").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.lowerCost.cannon2.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.lowerCost.cannon2.costCN;
        event.AmRev.weapon.cannon.costFactor = event.AmRev.upgrade.lowerCost.cannon2.costFactor;
        $("#lowerCostCannon2").remove();
    }
});

$("#morePowerSword1").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.sword1.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.sword1.costCN;
        event.AmRev.weapon.sword.powerMult = event.AmRev.upgrade.morePower.sword1.powerMult;
        $("#morePowerSword2").removeClass("hidden");
        $("#morePowerSword1").remove();
    }
});

$("#morePowerSword2").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.sword2.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.sword2.costCN;
        event.AmRev.weapon.sword.powerMult = event.AmRev.upgrade.morePower.sword2.powerMult;
        $("#morePowerSword3").removeClass("hidden");
        $("#morePowerSword2").remove();
    }
});

$("#morePowerSword3").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.sword3.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.sword3.costCN;
        event.AmRev.weapon.sword.powerMult = event.AmRev.upgrade.morePower.sword3.powerMult;
        $("#morePowerSword3").remove();
    }
});

$("#morePowerSpear1").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.spear1.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.spear1.costCN;
        event.AmRev.weapon.spear.powerMult = event.AmRev.upgrade.morePower.spear1.powerMult;
        $("#morePowerSpear2").removeClass("hidden");
        $("#morePowerSpear1").remove();
    }
});

$("#morePowerSpear2").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.spear2.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.spear2.costCN;
        event.AmRev.weapon.spear.powerMult = event.AmRev.upgrade.morePower.spear2.powerMult;
        $("#morePowerSpear3").removeClass("hidden");
        $("#morePowerSpear2").remove();
    }
});

$("#morePowerSpear3").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.spear3.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.spear3.costCN;
        event.AmRev.weapon.spear.powerMult = event.AmRev.upgrade.morePower.spear3.powerMult;
        $("#morePowerSpear3").remove();
    }
});

$("#morePowerMusket1").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.musket1.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.musket1.costCN;
        event.AmRev.weapon.musket.powerMult = event.AmRev.upgrade.morePower.musket1.powerMult;
        $("#morePowerMusket2").removeClass("hidden");
        $("#morePowerMusket1").remove();
    }
});

$("#morePowerMusket2").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.musket2.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.musket2.costCN;
        event.AmRev.weapon.musket.powerMult = event.AmRev.upgrade.morePower.musket2.powerMult;
        $("#morePowerMusket3").removeClass("hidden");
        $("#morePowerMusket2").remove();
    }
});

$("#morePowerMusket3").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.musket3.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.musket3.costCN;
        event.AmRev.weapon.musket.powerMult = event.AmRev.upgrade.morePower.musket3.powerMult;
        $("#morePowerMusket3").remove();
    }
});

$("#morePowerCannon1").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.cannon1.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.cannon1.costCN;
        event.AmRev.weapon.cannon.powerMult = event.AmRev.upgrade.morePower.cannon1.powerMult;
        $("#morePowerCannon2").removeClass("hidden");
        $("#morePowerCannon1").remove();
    }
});

$("#morePowerCannon2").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.cannon2.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.cannon2.costCN;
        event.AmRev.weapon.cannon.powerMult = event.AmRev.upgrade.morePower.cannon2.powerMult;
        $("#morePowerCannon3").removeClass("hidden");
        $("#morePowerCannon2").remove();
    }
});

$("#morePowerCannon3").click(function() {
    if (currency.colonialNotes.amount >= event.AmRev.upgrade.morePower.cannon3.costCN) {
        currency.colonialNotes.amount -= event.AmRev.upgrade.morePower.cannon3.costCN;
        event.AmRev.weapon.cannon.powerMult = event.AmRev.upgrade.morePower.cannon3.powerMult;
        $("#morePowerCannon3").remove();
    }
});

// Give the player a bonus for larger stockpiles
$("#sellAll").click(function() {
    var multiplier = 1;
    switch (periodCount) {
        case 1:
        case 2:
            if (goods.stockpile > 10000.00) {
                multiplier = 2;
            }
            else if ((goods.stockpile >= 5000.00) && (goods.stockpile <= 10000.00)) {
                multiplier = 1.5;
            }
            else {
                multiplier = 1;
            }
            currency.spanishDollar.amount += (goods.stockpile / goods.previousIncrement) * currency.spanishDollar.increment * multiplier;
            $("#sellAll").addClass("hidden");
            $("#goodsStockpile").addClass("hidden");
            break;
        // Nothing for case 3 because it is automatically implemented without player input
    }
});

/////////////////// Major Events (will eventually disappear from upgrade list) ///////////////////
$("#FIW").click(function() {
    if ((silver.amount >= event.FIW.costSilver) && (gold.amount >= event.FIW.costGold)) {
        silver.amount -= event.FIW.costSilver;
        event.FIW.costSilver = 0.00;
        gold.amount -= event.FIW.costGold;
        event.FIW.costGold = 0.00;
        event.FIW.fundRate = 1.00;
        timePeriod[1].tracker[1] = 0;
        $("#ToP1").removeClass("hidden");
        $("#costSilverFIW").remove();
        $("#costGoldFIW").remove();
        $("#FIW").text("When will it stop?");
    }
});

// When the page loads, update all values, objectives, and upgrades
$(document).ready(function() {
    updateValues();
    checkObjectives();
    checkUpgrades();
});

/////////////////// Timed events (NOT auto-clicking) ///////////////////
// Times out after tax rate is 60%
function taxHike() {
    if (taxRate < 0.60) {
        taxRate += 0.01;
        setTimeout(taxHike, 2*1000);
    }
}

///// Toggle switch for auto-clickers /////
var autoSwitch = 1;
/////////////////// Catch-All auto-clicking events ///////////////////
// Calculate total goods and selling rates to avoid stacked setInterval() calls
function calcPerSec() {
    if (autoSwitch === 1) {
        switch(periodCount) {
            case 0:
                if (goods.amount + (population.colonist.number * population.colonist.rate) + ((population.slave.number / population.slave.increment) * population.slave.rate) >= (population.merchant.rate1 * population.merchant.mult1)) {
                goods.amount += (population.colonist.number * population.colonist.rate) + ((population.slave.number / population.slave.increment) * population.slave.rate) - (population.merchant.rate1 * population.merchant.mult1);
                currency.spanishDollar.amount += population.merchant.rate2 * population.merchant.mult2;
                }
                population.number += upgrade.ship.number * upgrade.ship.rate;
                break;
            case 1:
                if (goods.amount + ((population.slave.number / population.slave.increment) * population.slave.rate) >= (population.merchant.rate1 * population.merchant.mult1)) {
                    goods.amount += ((population.slave.number / population.slave.increment) * population.slave.rate) - (population.merchant.rate1 * population.merchant.mult1);
                    currency.spanishDollar.amount += population.merchant.rate2 * population.merchant.mult2;
                }
            
                // FIW fund rate will increase as British soldiers increase
                if ((redCoat.number >= 300) && (redCoat.number < 600)) {
                    event.FIW.fundRate = 1.50;
                }
                else if ((redCoat.number >= 600) && (redCoat.number < 900)) {
                    event.FIW.fundRate = 2.00;
                }
                else if ((redCoat.number >= 900) && (redCoat.number < 1200)) {
                    event.FIW.fundRate = 2.50;
                }
                else if (redCoat.number >= 1200) {
                    event.FIW.fundRate = 3.00;
                }
            
                // Colonists do a much better job at mining gold than harvesting...anything, really
                if (gold.amount + (population.colonist.number * population.colonist.rate) >= event.FIW.fundRate) {
                    gold.amount += (population.colonist.number * population.colonist.rate) - event.FIW.fundRate;
                }
                if (silver.amount + (population.colonist.number * population.colonist.rate) >= event.FIW.fundRate) {
                    silver.amount += (population.colonist.number * population.colonist.rate) - event.FIW.fundRate;     
                }
                if (redCoat.number + ((population.colonist.number * population.colonist.rate) - event.FIW.fundRate) + (((population.colonist.number * population.colonist.rate) - event.FIW.fundRate) / 10) + (upgrade.military.warShipGB.number * upgrade.military.warShipGB.rate) >= 0) {
                    redCoat.number += (((population.colonist.number * population.colonist.rate) - event.FIW.fundRate) + (((population.colonist.number * population.colonist.rate) - event.FIW.fundRate) / 10) + (upgrade.military.warShipGB.number * upgrade.military.warShipGB.rate)) * upgrade.military.allies.nativeAmerican.multiplier;
                }
                population.number += upgrade.ship.number * upgrade.ship.rate;
                break;
            case 2:
                if (goods.amount + ((population.slave.number / population.slave.increment) * population.slave.rate) >= (population.merchant.rate1 * population.merchant.mult1)) {
                    goods.amount += ((population.slave.number / population.slave.increment) * population.slave.rate) - (population.merchant.rate1 * population.merchant.mult1);
                    currency.spanishDollar.amount += population.merchant.rate2 * population.merchant.mult2 * (1 - taxRate);
            }
                gold.amount += population.colonist.number * population.colonist.rate;
                silver.amount += population.colonist.number * population.colonist.rate;
                currency.colonialNotes.amount += currency.colonialNotes.rate;
                population.number += upgrade.ship.number * upgrade.ship.rate;
                break;
            case 3: // no ship, merchant, or mining activity during wartime
                currency.colonialNotes.amount += currency.colonialNotes.rate;
                currency.colonialNotes.total += currency.colonialNotes.rate;
        }
        updateValues();
    }
}

window.setInterval(calcPerSec, 1000);
