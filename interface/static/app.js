let graph_blue = "#124e87";
let graph_light_blue = "#9fbed6";
let graph_red = "#d60e0e";
let graph_green = "#0ed658";

function submitQuery() {
    var responseElement = document.getElementById("response");
    var firstChild = responseElement.firstChild;

    var query = document.getElementById("query").value;
    document.getElementById("query").value = "";

    var userQueryDiv = document.createElement("div"); // Create a new div element
    userQueryDiv.className = "user-query"; // Set the class of the new div element
    userQueryDiv.innerHTML = "<b class='author-name'>User: </b><div class='response-body'>" + query + "</div>"; // Set the inner HTML of the new div element

    responseElement.appendChild(userQueryDiv);
    responseElement.scrollTop = responseElement.scrollHeight;

    fetch("/interact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: query
            })
        })
        .then(response => response.json())
        .then(data => {
            var modelResponseDiv = document.createElement("div"); // Create a new div element
            modelResponseDiv.className = "model-response"; // Set the class of the new div element
            modelResponseDiv.innerHTML = "<b class='author-name'>AI Expert: </b><div class='response-body'>" + data.text + "</div>"; // Set the inner HTML of the new div element    

            if (data.line != null) {
                updateGraph_treatment(data.line[0], data.line.slice(1));
            }

            responseElement.appendChild(modelResponseDiv);
            responseElement.scrollTop = responseElement.scrollHeight;
        })
        .catch(error => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", function() {
    // Get the text input element
    var inputElement = document.getElementById("query");

    inputElement.addEventListener("keydown", function(event) {
        // Check if the pressed key is Enter and the input field is not empty
        if (event.key === "Enter" && inputElement.value.trim() !== "") {
            // Call the function to submit the query
            submitQuery();
        }
    });
});

function calculateRisk(ldl_rx = '0', ldl_dec = '0', sbp_rx = '0', sbp_dec = '0') {
    var inputsState = getCurrentInputsState();

    inputsState['ldl_rx'] = ldl_rx;
    inputsState['ldl_dec'] = ldl_dec;
    inputsState['sbp_rx'] = sbp_rx;
    inputsState['sbp_dec'] = sbp_dec;

    inputsState['bmi'] = document.getElementById("BMI-input").value;

    fetch("/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(inputsState)
        })
        .then(response => response.json())
        .then(data => {
            updateGraph_base(data['age'], data['data']);
        })
        .catch(error => console.error("Error:", error));
}

function getCurrentInputsState() {
    const inputItems = document.querySelectorAll(".sex-box input, #age-input, #TC-input, #LDL-input, #HDL-input, #SBP-input, #height-input, #weight-input, .diab-box input, .smoke-box input, .fmrtob-box input, .famhx-box input");

    const formData = {};

    inputItems.forEach(input => {
        if (input.type === 'radio') {
            // Handle radio buttons
            if (input.checked) {
                const key = input.name.replace(/(-value|-input)$/, ''); // Remove '-value' or '-input' suffix
                formData[key] = input.value;
            }
        } else {
            // Handle other input types (text, number, etc.)
            const key = input.id || input.name;
            const cleanKey = key.replace(/(-value|-input)$/, ''); // Remove '-value' or '-input' suffix
            formData[cleanKey] = input.value;
        }
    });

    return formData;
};

window.onload = function() {
    // ---------- BMI change script ---------- //
    const BMI_input = document.getElementById("BMI-input");
    const height_input = document.getElementById("height-input");
    height_input.addEventListener('input', calculate_BMI);
    const weight_input = document.getElementById("weight-input");
    weight_input.addEventListener('input', calculate_BMI);

    const height_units = document.getElementsByName("height-units");
    const weight_units = document.getElementsByName("height-units");

    function calculate_BMI() {
        var height, weight, bmi;
        height = height_input.value;
        weight = weight_input.value;

        bmi = weight / ((height / 100) ** 2)
        bmi = Math.round(bmi * 100) / 100;

        if (height > 9 && weight > 9) {
            BMI_input.value = bmi.toFixed(1);
        } else {
            BMI_input.value = "";
        }
    }
    // ---------- BMI change script ---------- //

    function refreshGraph(id) {
        var graphDiv = document.getElementById(id + '-graph');
        if (graphDiv.hasChildNodes()) {
            // Grab the existing data and layout
            var existingData = graphDiv.data;
            var existingLayout = graphDiv.layout;

            // Display using Plotly
            var config = {
                displayModeBar: false,
            };

            Plotly.newPlot(graphDiv, existingData, existingLayout, config);
        }
    };

    // ------ greyed out button ------ //
    const input_items = document.querySelectorAll(".sex-box input, #age-input, #TC-input, #LDL-input, #HDL-input, #SBP-input, #height-input, #weight-input, .diab-box input, .smoke-box input, .fmrtob-box input, .famhx-box input");

    for (const input of input_items) {
        input.addEventListener('input', function() {
            const submitButton = document.getElementById('calculate-risk');
            const allFieldsFilled = areAllFieldsFilled();
            submitButton.disabled = !allFieldsFilled; // Disable button if inputs are not filled
        });
    }

    function areAllFieldsFilled() {
        const inputElements = document.querySelectorAll(".sex-box input, #age-input, #TC-input, #LDL-input, #HDL-input, #SBP-input, #height-input, #weight-input, .diab-box input, .smoke-box input, .fmrtob-box input, .famhx-box input");

        for (const input of inputElements) {
            if (input.type === 'radio') {
                // Check radio buttons for at least one checked option in the group
                const groupName = input.name;
                const radioButtons = document.querySelectorAll(`input[name="${groupName}"]`);
                if (![...radioButtons].some(rb => rb.checked)) {
                    return false; // At least one radio button group is not checked
                }
            } else if (!input.value.trim()) {
                return false; // At least one input field is empty
            }
        }

        return true; // All input fields and radio buttons are filled/checked
    }

    const submitButton = document.getElementById('calculate-risk');
    let firstPressTime = null;

    submitButton.addEventListener('click', function() {
        if (firstPressTime === null) {
            firstPressTime = new Date();
            rightOverlay = document.getElementById('overlay');
            rightOverlay.style.visibility = 'hidden';
            assistantHeader = document.getElementById('assistant-header');
            assistantHeader.style.visibility = 'visible';
        }
    })
}

function updateGraph_base(age, risk) {
    risk = risk.map(function(x) {
        return x * 100;
    });

    var ages = [];
    for (var i = 30; i <= 80; i++) {
        ages.push(i)
    }

    var regular_line = {
        x: ages,
        y: risk,
        name: 'Your risk without intervention',
        mode: "lines",
        type: "scatter",
        hovertemplate: 'age: %{x}' + '<br>risk: %{y:.1f}%<br><extra></extra>',
        line: {
            color: graph_red,
        }
    };

    var data = [regular_line];
    var total_list = risk;

    // Display using Plotly
    var config = {
        displayModeBar: false,
    };

    var riskValue = (risk[risk.length - 1]).toFixed(1);

    var lifetimeRiskValue = document.getElementById('lifetime-risk');
    var lifetimeRiskValueNoRx = document.getElementById('lifetime-risk-no-rx');
    lifetimeRiskValue.innerHTML = riskValue + "%"
    lifetimeRiskValueNoRx.innerHTML = riskValue + "%"

    var riskBox = document.getElementById('risk-box');
    riskBox.style.display = "inline-block";
    var treatmentBox = document.getElementById('treatment-box');
    treatmentBox.style.display = "none";

    var ticks = [age];

    for (let i = Math.ceil(age / 10) * 10; i <= 80; i++) {
        if (i % 10 == 0) {
            ticks.push(i);
        }
    }

    var layout = {
        margin: {
            l: 60,
            r: 50,
            t: 50,
            b: 50
        },
        plot_bgcolor: 'rgba(0, 0, 0, 0)',
        hovermode: "closest",
        xaxis: {
            tickvals: ticks,
            zeroline: true,
            showspikes: true,
            spikecolor: 'rgb(150, 150, 150)',
            spikemode: 'across+toaxis',
            spikesnap: 'cursor',
            spikedash: 'solid',
            spikethickness: 1,
            range: [age, 80],
            fixedrange: true,
            automargin: true,
            title: {
                text: 'Age (years)',
                font: {
                    color: graph_blue,
                    size: 16
                },
                standoff: 10
            },
        },
        yaxis: {
            zeroline: true,
            showline: true,
            range: [0, Math.max(total_list) + 0.5],
            fixedrange: true,
            automargin: true,
            title: {
                text: 'Risk (%)',
                font: {
                    color: graph_blue,
                    size: 16
                },
                standoff: 12.5
            },
        },
        title: {
            text: "Your risk of having a heart attack or stroke",
            font: {
                color: graph_blue,
                size: 20
            }
        },
        legend: {
            x: 0,
            y: 1,
            traceorder: 'reversed',
            font: {
                size: 16,
                color: graph_blue,
            },
        }
    };

    var riskGraph = document.getElementById('risk-graph');
    var riskGraphRight = document.getElementById('risk-graph-right');
    riskGraphRight.style.borderLeft = "1px solid #ccc";
    riskGraphRight.style.backgroundColor = "white";
    Plotly.newPlot(riskGraph, data, layout, config);
}

function updateGraph_treatment(age, risk_rx) {
    var graphDiv = document.getElementById('risk-graph');
    if (graphDiv.hasChildNodes()) {
        // Grab the existing data and layout
        var existingData = JSON.parse(JSON.stringify(graphDiv.data));
        var existingLayout = JSON.parse(JSON.stringify(graphDiv.layout));

        // Display using Plotly
        var config = {
            displayModeBar: false,
        };

        risk_rx = risk_rx.map(function(x) {
            return x * 100;
        });

        var ages = [];
        for (var i = 30; i <= 80; i++) {
            ages.push(i)
        }

        // Initialize an array to store the extracted y-values
        var existingRisks = [];
        existingData.forEach(function(trace) {
            if (trace.y) {
                existingRisks.push(trace.y);
            }
        });
        existingRisks = existingRisks[0];

        var riskValue_rx = (risk_rx[risk_rx.length - 1]).toFixed(1);

        var lifetimeRiskValueWithRx = document.getElementById('lifetime-risk-with-rx');
        lifetimeRiskValueWithRx.innerHTML = riskValue_rx + "%"

        var riskBox = document.getElementById('risk-box');
        riskBox.style.display = "none";
        var treatmentBox = document.getElementById('treatment-box');
        treatmentBox.style.display = "inline-block";

        // Remove any existing treatment line
        existingData = existingData.filter(function(trace) {
            return trace.name !== 'Your risk with intervention';
        });

        var treatment_line = {
            x: ages,
            y: risk_rx,
            name: 'Your risk with intervention',
            mode: "lines",
            type: "scatter",
            hovertemplate: 'age: %{x}' + '<br>risk: %{y:.1f}%<br><extra></extra>',
            line: {
                color: graph_blue,
            }
        };

        existingData.push(treatment_line);

        var total_list = existingRisks + risk_rx;
        existingLayout.yaxis.range = [0, Math.max(total_list) + 0.5];

        var treatmentGraph = document.getElementById('risk-graph');
        Plotly.newPlot(treatmentGraph, existingData, existingLayout, config);
    }
}