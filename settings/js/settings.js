/* global Homey, $, __ */

function clearBusy() {
	$('#busy').hide();
}

function clearError() {
	$('#error').hide();
}

function clearSuccess() {
	$('#success').hide();
}

function showBusy(message, showTime) {
	clearError();
	clearSuccess();
	$('#busy span').html(message);
	$('#busy').show();
	if (showTime) {
		$('#busy').delay(showTime).fadeOut();
	}
}

function showError(message, showTime) {
	clearBusy();
	clearSuccess();
	$('#error span').html(message);
	$('#error').show();
	if (showTime) {
		$('#error').delay(showTime).fadeOut();
	}
}

function showSuccess(message, showTime) {
	clearBusy();
	clearError();
	$('#success span').html(message);
	$('#success').show();
	if (showTime) {
		$('#success').delay(showTime).fadeOut();
	}
}

function initSettings() {
	clearBusy();
	clearError();
	clearSuccess();
	Homey.get('settings', function(error, settings) {
		if (error) {
			return console.error(error);
		}
		if (settings !== null) {
			$('#vigil').prop('checked', settings.vigil);
		} else {
			$('#vigil').prop('checked', false);
		}
	});
}

function saveSettings() {
	var settings = {
		vigil: $('#vigil').prop('checked')
	};
	$('#saveSettings').prop('disabled', true);
	showBusy(__('settings.messages.busySaving'));
	setTimeout(function() {
		Homey.set('settings', settings, function(error, settings) {
			$('#saveSettings').prop('disabled', false);
			if (error) {
				return showError(__('settings.messages.errorSaving'));
			}
			showSuccess(__('settings.messages.successSaving'), 3000);
		});
	}, 2000);
}

function onHomeyReady() {
	initSettings();
	Homey.ready();
}