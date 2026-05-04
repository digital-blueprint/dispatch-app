/**
 * Content from https://github.com/select2/select2/blob/master/src/js/select2/i18n/en.js
 */
export default function () {
    // English
    return {
        errorLoading: function () {
            return 'The results could not be loaded.';
        },
        inputTooLong: function (args) {
            var overChars = args.input.length - args.maximum;

            var message = 'Please delete ' + overChars + ' character';

            if (overChars != 1) {
                message += 's';
            }

            return message;
        },
        inputTooShort: function (args) {
            var remainingChars = args.minimum - args.input.length;

            var message =
                'Enter at least ' +
                remainingChars +
                ' consecutive characters from the word you are looking for.';

            return message;
        },
        loadingMore: function () {
            return 'Loading more results…';
        },
        maximumSelected: function (args) {
            var message = 'You can only select ' + args.maximum + ' item';

            if (args.maximum != 1) {
                message += 's';
            }

            return message;
        },
        noResults: function () {
            return 'No results found';
        },
        searching: function () {
            return 'Searching…';
        },
        removeAllItems: function () {
            return 'Remove all items';
        },
    };
}
