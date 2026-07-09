/**
 * @file Handles due-date formatting, picker sync and validation for Add Task.
 */


/**
 * Converts a date in DD/MM/YYYY format into the ISO format YYYY-MM-DD.
 *
 * @param {string} dateStr - Date in DD/MM/YYYY format
 * @returns {string} Date in YYYY-MM-DD format
 */
function ddmmyyyyToISO(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}


/* ── Due Date ── */
/**
 * Automatically formats the due-date field as DD/MM/YYYY while typing.
 *
 * @returns {void}
 */
function setupDueDateInput() {
    const input  = document.getElementById('taskDueDate');
    const picker = document.getElementById('taskDueDatePicker');

    setDueDatePickerMinDate(picker);
    input.addEventListener('keydown', handleDueDateBackspace);
    input.addEventListener('input', (event) => {
        formatDueDateInput(event);
        toggleRequiredError(input, document.getElementById('taskDueDateError'), false);
    });
    picker.addEventListener('change', (e) => {
        syncPickerDateToTextInput(e, input);
        validateDueDate(input);
    });
    input.addEventListener('blur', () => validateDueDate(input));
}


/**
 * Sets the native due-date picker minimum to today's local date.
 *
 * @param {HTMLInputElement} picker - Hidden native date input.
 * @returns {void}
 */
function setDueDatePickerMinDate(picker) {
    picker.min = getLocalISODate();
}


/**
 * Removes a trailing slash before the browser deletes another character.
 *
 * @param {KeyboardEvent} event - Keydown event from the due-date text input.
 * @returns {void}
 */
function handleDueDateBackspace(event) {
    const input = event.target;
    if (event.key !== 'Backspace') return;
    if (input.value.endsWith('/')) input.value = input.value.slice(0, -1);
}


/**
 * Formats manual due-date input as DD/MM/YYYY while typing.
 *
 * @param {InputEvent} event - Input event from the due-date text field.
 * @returns {void}
 */
function formatDueDateInput(event) {
    const input = event.target;
    const cursorPosition = input.selectionStart || 0;
    const digitCount = countDigitsBeforeCursor(input.value, cursorPosition);
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    const formatted = formatDueDateDigits(digits);
    const newCursorPosition = getCursorPositionAfterFormatting(formatted, digitCount);
    input.value = formatted;
    restoreInputCursor(input, newCursorPosition);
}


/**
 * Counts numeric characters before the current cursor position.
 *
 * @param {string} value - Current input value.
 * @param {number} cursorPosition - Current cursor position.
 * @returns {number} Number of digits before the cursor.
 */
function countDigitsBeforeCursor(value, cursorPosition) {
    return value.slice(0, cursorPosition).replace(/\D/g, '').length;
}


/**
 * Formats up to eight due-date digits as DD/MM/YYYY.
 *
 * @param {string} digits - Numeric due-date value.
 * @returns {string} Formatted due-date value.
 */
function formatDueDateDigits(digits) {
    if (digits.length >= 5) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
}


/**
 * Finds the cursor position after keeping the same digit offset.
 *
 * @param {string} formattedValue - Formatted due-date value.
 * @param {number} digitCountBeforeCursor - Digit count before formatting.
 * @returns {number} Cursor position in the formatted value.
 */
function getCursorPositionAfterFormatting(formattedValue, digitCountBeforeCursor) {
    let digitsFound = 0;
    if (digitCountBeforeCursor === 0) return 0;
    for (let i = 0; i < formattedValue.length; i++) {
        if (/\d/.test(formattedValue[i])) digitsFound++;
        if (digitsFound === digitCountBeforeCursor) return i + 1;
    }
    return formattedValue.length;
}


/**
 * Restores a collapsed cursor selection in an input.
 *
 * @param {HTMLInputElement} input - Input whose cursor should be restored.
 * @param {number} position - Cursor position to restore.
 * @returns {void}
 */
function restoreInputCursor(input, position) {
    input.setSelectionRange(position, position);
}


/**
 * Copies the native picker value into the visible DD/MM/YYYY field.
 * Validation is left to the caller so the correct error element is used.
 *
 * @param {Event} event - Change event from the hidden date picker.
 * @param {HTMLInputElement} input - Visible due-date text input.
 * @returns {void}
 */
function syncPickerDateToTextInput(event, input) {
    if (!event.target.value) return;
    const [year, month, day] = event.target.value.split('-');
    input.value = `${day}/${month}/${year}`;
}


/**
 * Validates the due-date field and toggles its error state.
 *
 * @param {HTMLInputElement} input - Visible due-date text input.
 * @returns {void}
 */
function validateDueDate(input) {
    const error = document.getElementById('taskDueDateError');

    if (!validateDueDateInputValue(input, error)) return false;

    const selected = new Date(`${ddmmyyyyToISO(input.value)}T00:00:00`);

    if (isPastDate(selected)) {
        showDueDateError(input, error, 'Please select today or a future date');
        return false;
    }

    toggleRequiredError(input, error, false);
    return true;
}


/**
 * Validates whether the due-date input contains a non-empty valid date value.
 *
 * @param {HTMLInputElement} input - Visible due-date text input.
 * @param {HTMLElement} error - Due-date error message element.
 * @returns {boolean} Whether the input contains a valid date value.
 */
function validateDueDateInputValue(input, error) {
    if (!input.value.trim()) {
        showDueDateError(input, error, 'This field is required');
        return false;
    }

    if (!isValidDueDateValue(input.value)) {
        showDueDateError(input, error, 'Please enter a valid date');
        return false;
    }

    return true;
}


/**
 * Checks whether a due-date value is a real date in DD/MM/YYYY format.
 *
 * @param {string} value - Due-date value to validate.
 * @returns {boolean} Whether the value is a valid calendar date.
 */
function isValidDueDateValue(value) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;

    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}


/**
 * Shows a due-date validation message and marks the input invalid.
 *
 * @param {HTMLInputElement} input - Visible due-date text input.
 * @param {HTMLElement} error - Due-date error message element.
 * @param {string} message - Validation message to display.
 * @returns {void}
 */
function showDueDateError(input, error, message) {
    error.textContent = message;
    toggleRequiredError(input, error, true);
}


/**
 * Returns today's date as YYYY-MM-DD using the local timezone.
 *
 * @returns {string} Local ISO-like date string.
 */
function getLocalISODate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


/**
 * Returns today's local midnight.
 *
 * @returns {Date} Date object at local day start.
 */
function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}


/**
 * Checks whether a date is before today's local day start.
 *
 * @param {Date} date - Date to compare.
 * @returns {boolean} Whether the date is in the past.
 */
function isPastDate(date) {
    return date < getTodayStart();
}


/**
 * Opens the native date picker for the hidden due-date input.
 *
 * @returns {void}
 */
function openDueDatePicker() {
    const picker = document.getElementById('taskDueDatePicker');
    if (picker.showPicker) {
        picker.showPicker();
    } else {
        picker.click();
    }
}
