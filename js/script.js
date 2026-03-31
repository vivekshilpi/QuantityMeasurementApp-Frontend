/**
 * Quantity Measurement App
 * Connected to Backend REST API
 */

// ==========================================
// CONFIGURATION
// ==========================================

const API_BASE_URL = 'http://localhost:8080';

// ==========================================
// UNIT DATA (for dropdown population)
// ==========================================

const UNITS = {
    Length: [
        { value: 'INCH', label: 'Inch' },
        { value: 'FOOT', label: 'Foot' },
        { value: 'YARD', label: 'Yard' },
        { value: 'CENTIMETER', label: 'Centimetre' }
    ],
    Weight: [
        { value: 'GRAM', label: 'Gram' },
        { value: 'KILOGRAM', label: 'Kilogram' },
        { value: 'MILLIGRAM', label: 'Milligram' },
        { value: 'POUND', label: 'Pound' },
        { value: 'TONNE', label: 'Tonne' }
    ],
    Volume: [
        { value: 'LITRE', label: 'Litre' },
        { value: 'MILLILITRE', label: 'Millilitre' },
        { value: 'GALLON', label: 'Gallon' }
    ],
    Temperature: [
        { value: 'CELSIUS', label: 'Celsius' },
        { value: 'FAHRENHEIT', label: 'Fahrenheit' },
        { value: 'KELVIN', label: 'Kelvin' }
    ]
};

// Map frontend type names to backend measurementType
const TYPE_MAP = {
    'Length': 'LengthUnit',
    'Weight': 'WeightUnit',
    'Volume': 'VolumeUnit',
    'Temperature': 'TemperatureUnit'
};

// ==========================================
// STATE
// ==========================================

let selectedType = null;
let selectedAction = 'conversion';
let comparisonDebounceTimer = null;

// ==========================================
// DOM ELEMENTS
// ==========================================

const typeCards = document.querySelectorAll('.type-card');
const actionTabs = document.querySelectorAll('.action-tab');
const conversionSection = document.getElementById('conversionSection');
const comparisonSection = document.getElementById('comparisonSection');
const arithmeticSection = document.getElementById('arithmeticSection');

// Conversion elements
const fromValue = document.getElementById('fromValue');
const fromUnit = document.getElementById('fromUnit');
const toValue = document.getElementById('toValue');
const toUnit = document.getElementById('toUnit');
const convertBtn = document.getElementById('convertBtn');

// Comparison elements
const compareValue1 = document.getElementById('compareValue1');
const compareUnit1 = document.getElementById('compareUnit1');
const compareValue2 = document.getElementById('compareValue2');
const compareUnit2 = document.getElementById('compareUnit2');
const compareBtn = document.getElementById('compareBtn');
const comparisonResult = document.getElementById('comparisonResult');
const compareResultText = document.getElementById('compareResultText');

// Arithmetic elements
const value1 = document.getElementById('value1');
const unit1 = document.getElementById('unit1');
const value2 = document.getElementById('value2');
const unit2 = document.getElementById('unit2');
const operator = document.getElementById('operator');
const arithmeticBtn = document.getElementById('arithmeticBtn');
const resultValue = document.getElementById('resultValue');
const resultUnit = document.getElementById('resultUnit');

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTypeCards();
    initializeActionTabs();
    initializeButtons();
    initializeLiveComparison();
    updateUserInfo();
});

function initializeTypeCards() {
    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            typeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedType = card.dataset.type;
            populateUnits();
            // Hide comparison result when type changes
            if (comparisonResult) comparisonResult.style.display = 'none';
        });
    });
}

function initializeActionTabs() {
    actionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            actionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedAction = tab.dataset.action;
            updateActionUI();
        });
    });
}

function initializeButtons() {
    if (convertBtn) {
        convertBtn.addEventListener('click', handleConversion);
    }
    if (compareBtn) {
        compareBtn.addEventListener('click', handleComparison);
    }
    if (arithmeticBtn) {
        arithmeticBtn.addEventListener('click', handleArithmetic);
    }
}

// ==========================================
// LIVE COMPARISON - Auto-compare on input change
// ==========================================

function initializeLiveComparison() {
    const comparisonInputs = [compareValue1, compareUnit1, compareValue2, compareUnit2];

    comparisonInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', triggerLiveComparison);
            input.addEventListener('change', triggerLiveComparison);
        }
    });
}

function triggerLiveComparison() {
    // Debounce to avoid too many API calls
    clearTimeout(comparisonDebounceTimer);
    comparisonDebounceTimer = setTimeout(() => {
        handleComparison(true); // true = silent mode (no alerts)
    }, 300);
}

// ==========================================
// UI UPDATES
// ==========================================

function populateUnits() {
    if (!selectedType) return;

    const units = UNITS[selectedType] || [];
    const optionsHTML = '<option value="">Select Unit</option>' +
        units.map(u => `<option value="${u.value}">${u.label}</option>`).join('');

    // Populate all unit dropdowns
    [fromUnit, toUnit, compareUnit1, compareUnit2, unit1, unit2, resultUnit].forEach(select => {
        if (select) {
            select.innerHTML = optionsHTML;
            select.disabled = false;
        }
    });

    // Reset values
    if (fromValue) fromValue.value = '';
    if (toValue) toValue.value = '';
    if (compareValue1) compareValue1.value = '';
    if (compareValue2) compareValue2.value = '';
    if (value1) value1.value = '';
    if (value2) value2.value = '';
    if (resultValue) resultValue.textContent = '0';
}

function updateActionUI() {
    // Hide all sections first
    if (conversionSection) conversionSection.classList.add('hidden');
    if (comparisonSection) comparisonSection.classList.add('hidden');
    if (arithmeticSection) arithmeticSection.classList.add('hidden');

    // Show the appropriate section
    if (selectedAction === 'conversion') {
        if (conversionSection) conversionSection.classList.remove('hidden');
    } else if (selectedAction === 'comparison') {
        if (comparisonSection) comparisonSection.classList.remove('hidden');
    } else if (selectedAction === 'arithmetic') {
        if (arithmeticSection) arithmeticSection.classList.remove('hidden');
    }
}

// ==========================================
// API HELPERS
// ==========================================

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function apiCall(endpoint, body) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('API Response:', endpoint, data);

        if (!response.ok || data.error) {
            throw new Error(data.errorMessage || data.message || `API error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==========================================
// CONVERSION - Backend API
// ==========================================

async function handleConversion() {
    if (!selectedType) {
        alert('Please select a measurement type first');
        return;
    }

    const value = parseFloat(fromValue.value);
    const from = fromUnit.value;
    const to = toUnit.value;

    if (isNaN(value)) {
        alert('Please enter a valid value');
        return;
    }
    if (!from) {
        alert('Please select the FROM unit');
        return;
    }
    if (!to) {
        alert('Please select the TO unit');
        return;
    }

    // Build request for backend
    const requestBody = {
        thisQuantityDTO: {
            value: value,
            unit: from,
            measurementType: TYPE_MAP[selectedType]
        },
        thatQuantityDTO: {
            value: 0,
            unit: to,
            measurementType: TYPE_MAP[selectedType]
        }
    };

    try {
        convertBtn.textContent = 'Converting...';
        convertBtn.disabled = true;

        const result = await apiCall('/api/v1/quantities/convert', requestBody);

        // Backend returns result like "1.0833333333333333 Foot"
        // Extract just the number
        const resultStr = result.result || '';
        const numericPart = parseFloat(resultStr.split(' ')[0]);

        toValue.value = isNaN(numericPart) ? resultStr : formatNumber(numericPart);

    } catch (error) {
        alert('Conversion failed: ' + error.message);
    } finally {
        convertBtn.textContent = 'Convert';
        convertBtn.disabled = false;
    }
}

// ==========================================
// COMPARISON - Backend API (with live update)
// ==========================================

async function handleComparison(silent = false) {
    if (!selectedType) {
        if (!silent) alert('Please select a measurement type first');
        return;
    }

    const val1 = parseFloat(compareValue1.value);
    const u1 = compareUnit1.value;
    const val2 = parseFloat(compareValue2.value);
    const u2 = compareUnit2.value;

    // For live comparison, just hide result if inputs are incomplete
    if (isNaN(val1) || !u1 || isNaN(val2) || !u2) {
        if (!silent) {
            if (isNaN(val1)) alert('Please enter Value 1');
            else if (!u1) alert('Please select Unit 1');
            else if (isNaN(val2)) alert('Please enter Value 2');
            else if (!u2) alert('Please select Unit 2');
        }
        if (comparisonResult) comparisonResult.style.display = 'none';
        return;
    }

    // Build request for backend
    const requestBody = {
        thisQuantityDTO: {
            value: val1,
            unit: u1,
            measurementType: TYPE_MAP[selectedType]
        },
        thatQuantityDTO: {
            value: val2,
            unit: u2,
            measurementType: TYPE_MAP[selectedType]
        }
    };

    try {
        if (!silent) {
            compareBtn.textContent = 'Comparing...';
            compareBtn.disabled = true;
        }

        const result = await apiCall('/api/v1/quantities/compare', requestBody);

        // Show inline result
        comparisonResult.style.display = 'flex';

        // Backend returns "true" or "false" as string
        const isEqual = result.result === 'true' || result.result === true;

        // Get unit labels for display
        const unit1Label = getUnitLabel(u1);
        const unit2Label = getUnitLabel(u2);

        if (isEqual) {
            compareResultText.textContent = `✅ ${val1} ${unit1Label} is EQUAL to ${val2} ${unit2Label}`;
            compareResultText.style.color = '#10B981';
        } else {
            // To determine which is bigger, we need to convert both to same unit and compare
            // For now, we'll do a simple conversion comparison
            const comparisonText = await getComparisonDescription(val1, u1, val2, u2);
            compareResultText.textContent = comparisonText;
            compareResultText.style.color = '#EF4444';
        }

    } catch (error) {
        if (!silent) alert('Comparison failed: ' + error.message);
        if (comparisonResult) {
            comparisonResult.style.display = 'flex';
            compareResultText.textContent = '❌ Error: ' + error.message;
            compareResultText.style.color = '#EF4444';
        }
    } finally {
        if (!silent) {
            compareBtn.textContent = 'Compare';
            compareBtn.disabled = false;
        }
    }
}

// Helper to get comparison description (which is bigger)
async function getComparisonDescription(val1, unit1, val2, unit2) {
    const unit1Label = getUnitLabel(unit1);
    const unit2Label = getUnitLabel(unit2);

    try {
        // Convert val1 to unit2's unit to compare
        const requestBody = {
            thisQuantityDTO: {
                value: val1,
                unit: unit1,
                measurementType: TYPE_MAP[selectedType]
            },
            thatQuantityDTO: {
                value: 0,
                unit: unit2,
                measurementType: TYPE_MAP[selectedType]
            }
        };

        const result = await apiCall('/api/v1/quantities/convert', requestBody);
        const convertedValue = parseFloat(result.result.split(' ')[0]);

        if (convertedValue > val2) {
            return `📈 ${val1} ${unit1Label} is GREATER than ${val2} ${unit2Label}`;
        } else {
            return `📉 ${val1} ${unit1Label} is LESS than ${val2} ${unit2Label}`;
        }
    } catch (e) {
        // Fallback if conversion fails
        return `❌ ${val1} ${unit1Label} is NOT EQUAL to ${val2} ${unit2Label}`;
    }
}

function getUnitLabel(unitValue) {
    if (!selectedType) return unitValue;
    const units = UNITS[selectedType] || [];
    const unit = units.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue;
}

// ==========================================
// ARITHMETIC - Backend API
// ==========================================

async function handleArithmetic() {
    if (!selectedType) {
        alert('Please select a measurement type first');
        return;
    }

    if (selectedType === 'Temperature') {
        alert('Temperature does not support arithmetic operations');
        return;
    }

    const val1 = parseFloat(value1.value);
    const val2 = parseFloat(value2.value);
    const u1 = unit1.value;
    const u2 = unit2.value;
    const op = operator.value;

    if (isNaN(val1)) {
        alert('Please enter Value 1');
        return;
    }
    if (isNaN(val2)) {
        alert('Please enter Value 2');
        return;
    }
    if (!u1) {
        alert('Please select Unit 1');
        return;
    }
    if (!u2) {
        alert('Please select Unit 2');
        return;
    }

    // Map operator to endpoint
    const operatorEndpoints = {
        'add': '/api/v1/quantities/add',
        'subtract': '/api/v1/quantities/subtract',
        'divide': '/api/v1/quantities/divide'
    };

    const endpoint = operatorEndpoints[op];
    if (!endpoint) {
        alert('Invalid operation');
        return;
    }

    // Build request
    const requestBody = {
        thisQuantityDTO: {
            value: val1,
            unit: u1,
            measurementType: TYPE_MAP[selectedType]
        },
        thatQuantityDTO: {
            value: val2,
            unit: u2,
            measurementType: TYPE_MAP[selectedType]
        }
    };

    try {
        arithmeticBtn.textContent = 'Calculating...';
        arithmeticBtn.disabled = true;

        const result = await apiCall(endpoint, requestBody);

        // Backend returns result like "24 Inch" for add/subtract or just "2" for divide
        const resultStr = result.result || '0';
        const parts = resultStr.split(' ');
        const numericPart = parseFloat(parts[0]);
        const unitPart = parts[1] || '';

        resultValue.textContent = isNaN(numericPart) ? resultStr : formatNumber(numericPart);

        // Update result unit dropdown
        if (resultUnit && unitPart) {
            // Try to find matching unit value from the unit name
            const units = UNITS[selectedType] || [];
            const matchingUnit = units.find(u =>
                u.label.toLowerCase() === unitPart.toLowerCase() ||
                u.value.toLowerCase() === unitPart.toLowerCase()
            );
            if (matchingUnit) {
                resultUnit.value = matchingUnit.value;
            }
        } else if (resultUnit) {
            resultUnit.value = u1;
        }

    } catch (error) {
        alert('Calculation failed: ' + error.message);
        resultValue.textContent = 'Error';
    } finally {
        arithmeticBtn.textContent = 'Calculate';
        arithmeticBtn.disabled = false;
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    // Round to 4 decimal places and remove trailing zeros
    const rounded = Math.round(num * 10000) / 10000;
    return rounded.toString();
}

// ==========================================
// AUTH FUNCTIONS
// ==========================================

function updateUserInfo() {
    const userNameEl = document.getElementById('userName');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (userNameEl && currentUser) {
        const name = currentUser.fullName || currentUser.name || 'User';
        userNameEl.textContent = 'Hi, ' + name.split(' ')[0];
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
