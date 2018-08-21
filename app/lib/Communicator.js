/**
 * Communicator.js
 *
 * This file handles all the complexity related to network communication. It connects to the server and returns the response.
 * It also checks for the internet connection, errors in response and handles them gracefully.
 */
var Communicator = {};
/**
 * This is a generic function for performing POST requests
 */
exports.post = function(url, data, callback) {
	if (Titanium.Network.online) {
		// Create an HTTPClient.
		var httpClient = Ti.Network.createHTTPClient();
		httpClient.setTimeout(30000);

		// Define the callback.
		httpClient.onload = function(e) {
			Ti.API.info('*****************web service response - timestamp: 1' + new Date() + '*********************');
			Ti.API.info('POST e ' + JSON.stringify(e));
			if (e.success) {
				if (this.status == 200) {

					if (this.responseText != null && this.responseText.trim().length > 0) {
						var result = {};
						result.success = true;
						result.response = this.responseText;
						callback(result);

					} else {
						var result = {};
						result.success = false;
						var MSG_NO_DATA = Alloy.Globals.Constants.MSG_NO_DATA;
						result.message = MSG_NO_DATA;
						callback(result);
					}
				} else {
					var result = {};
					result.success = false;
					var MSG_STATUS_CODE = Alloy.Globals.Constants.MSG_STATUS_CODE;
					result.message = MSG_STATUS_CODE + this.status;
					callback(result);
				}
			} else {
				var result = {};
				result.success = false;
				result.message = e.error;
				callback(result);
			}
		};
		httpClient.onerror = function(e) {
			var result = {};
			result.success = false;
			Ti.API.info('e.error ' + e.error);
			if (e.error == 'HTTP error') {
				result.message = Alloy.Globals.Constants.UNABLE_TO_CONNECT;
			} else {
				result.message = e.error;
			}
			callback(result);
		};

		// Send the request data.
		try {
			httpClient.open('POST', url);
			httpClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			Ti.API.info('*****************web service call - timestamp: ' + new Date() + '*********************');

			httpClient.send(data);
		} catch(e) {
			Alloy.Globals.toast(e.message);
			tracker.addException({
				description : "Communicator => post: " + e.message,
				fatal : false
			});
		}

	} else {

		var result = {};
		result.success = false;
		var MSG_NO_NETWORK = Alloy.Globals.Constants.MSG_NO_NETWORK;
		result.message = MSG_NO_NETWORK;
		callback(result);
		Alloy.Globals.LoadingScreen.close();

	}
};

/**
 * This is a generic function for performing GET requests
 */
exports.get = function(url, callback) {
	if (Titanium.Network.online) {
		// Create an HTTPClient.
		var httpClient = Ti.Network.createHTTPClient();
		httpClient.setTimeout(30000);

		// Define the callback.
		httpClient.onload = function(e) {
			Ti.API.info('*****************web service response - timestamp: 2 ' + new Date() + '*********************');
			// Ti.API.info('get : ' + JSON.stringify(e));
			if (e.success) {
				// Ti.API.info('this Status : ' + this.status);
				if (this.status == 200) {
					// Ti.API.info('this responseText : ' + this.responseText);
					if (this.responseText != null && this.responseText.trim().length > 0) {
						var result = {};
						result.success = true;
						result.response = this.responseText;
						callback(result);
					} else {
						var result = {};
						result.success = false;
						var MSG_NO_DATA = Alloy.Globals.Constants.MSG_NO_DATA;
						result.message = MSG_NO_DATA;
						callback(result);
					}
				} else {
					var result = {};
					result.success = false;
					var MSG_STATUS_CODE = Alloy.Globals.Constants.MSG_STATUS_CODE;
					result.message = MSG_STATUS_CODE + this.status;
					callback(result);
				}
			} else {
				var result = {};
				result.success = false;
				result.message = e.error;
				callback(result);
			}
		};
		httpClient.onerror = function(e) {
			var result = {};
			result.success = false;
			Ti.API.info('e.error ' + e.error);
			if (e.error == 'HTTP error') {
				result.message = Alloy.Globals.Constants.UNABLE_TO_CONNECT;
			} else {
				result.message = e.error;
			}
			callback(result);
		};

		// Send the request data.
		try {
			httpClient.open('GET', url);
			httpClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			Ti.API.info('*****************web service call - timestamp: ' + new Date() + '*********************');

			httpClient.send();
		} catch(e) {
			Alloy.Globals.toast(e.message);
			tracker.addException({
				description : "Communicator => get: " + e.message,
				fatal : false
			});
		}

	} else {

		var result = {};
		result.success = false;
		var MSG_NO_NETWORK = Alloy.Globals.Constants.MSG_NO_NETWORK;
		result.message = MSG_NO_NETWORK;
		callback(result);

	}
};

/**
 * This is a generic function for performing POST requests
 */
exports.placeOrder = function(url, data, callback) {
	if (Titanium.Network.online) {
		// Create an HTTPClient.
		var httpClient = Ti.Network.createHTTPClient();
		httpClient.setTimeout(30000);

		// Define the callback.
		httpClient.onload = function(e) {
			Ti.API.info('*****************web service response - timestamp:3 ' + new Date() + '*********************');
			if (e.success) {
				if (this.status == 200) {

					if (this.responseText != null && this.responseText.trim().length > 0) {
						var result = {};
						result.success = true;
						result.response = this.responseText;

						if (JSON.parse(result.response).response_code == 2) {
							Ti.API.info('Communicator PLACE ORDER Social_type check response_code 2');
							if (Ti.App.Properties.getObject("LoginData") != null && Ti.App.Properties.getObject("LoginData") != undefined) {
								if (Ti.App.Properties.getObject("LoginData").social_type == "1") {
									fb.logout();
								} else if (Ti.App.Properties.getObject("LoginData").social_type == "2") {
									Google.signOut();
								}

								Ti.App.Properties.setObject("LoginData", null);
								Ti.App.Properties.setObject("ProfileData", null);
								Alloy.Globals.cartItems = [];
								remainingLoyalties = null;
								Alloy.Globals.switchBtnNames();
								if (CurrentWindow != "WelcomeScreen") {
									var WelcomeScreen = Alloy.createController("WelcomeScreen");
									CurrentWindow = WelcomeScreen.getView().name;
					
									if (OS_IOS) {
										Alloy.Globals.drawer.centerWindow = WelcomeScreen.navWin;
									} else {
										var titleIs = {
											"Title" : L("HOME"),
										};
										Alloy.Globals.appearWin(titleIs);
										Alloy.Globals.drawer.centerView = WelcomeScreen.getView();
									}
					
								}
								return;
							}

						}

						callback(result);
					} else {
						var result = {};
						result.success = false;
						var MSG_NO_DATA = Alloy.Globals.Constants.MSG_NO_DATA;
						result.message = MSG_NO_DATA;
						callback(result);
					}
				} else {
					var result = {};
					result.success = false;
					var MSG_STATUS_CODE = Alloy.Globals.Constants.MSG_STATUS_CODE;
					result.message = MSG_STATUS_CODE + this.status;
					callback(result);
				}
			} else {
				var result = {};
				result.success = false;
				result.message = e.error;
				callback(result);
			}
		};
		httpClient.onerror = function(e) {
			var result = {};
			result.success = false;
			Ti.API.info('e.error ' + e.error);
			if (e.error == 'HTTP error') {
				result.message = Alloy.Globals.Constants.UNABLE_TO_CONNECT;
			} else {
				result.message = e.error;
			}
			callback(result);
		};

		// Send the request data.
		try {
			httpClient.open('POST', url);
			// httpClient.setRequestHeader("Content-Type", "application/json");

			Ti.API.info('*****************web service call - timestamp: ' + new Date() + '*********************');

			httpClient.send(data);
		} catch(e) {
			Alloy.Globals.toast(e.message);
			tracker.addException({
				description : "Communicator => placeOrder: " + e.message,
				fatal : false
			});
		}

	} else {

		var result = {};
		result.success = false;
		var MSG_NO_NETWORK = Alloy.Globals.Constants.MSG_NO_NETWORK;
		result.message = MSG_NO_NETWORK;
		callback(result);

	}
};

/**
 * This is a generic function for performing POST requests (Multi Part Header Request)
 */
exports.postProfileImage = function(url, data, ProfileImage, callback) {
	if (Titanium.Network.online) {
		// Create an HTTPClient.
		var httpClient = Ti.Network.createHTTPClient();
		httpClient.setTimeout(30000);

		// Define the callback.
		httpClient.onload = function(e) {
			Ti.API.info('*****************web service response - timestamp: 4' + new Date() + '*********************');
			if (e.success) {
				if (this.status == 200) {

					if (this.responseText != null && this.responseText.trim().length > 0) {
						var result = {};
						result.success = true;
						result.response = this.responseText;
						callback(result);
					} else {
						var result = {};
						result.success = false;
						var MSG_NO_DATA = Alloy.Globals.Constants.MSG_NO_DATA;
						result.message = MSG_NO_DATA;
						callback(result);
					}
				} else {
					var result = {};
					result.success = false;
					var MSG_STATUS_CODE = Alloy.Globals.Constants.MSG_STATUS_CODE;
					result.message = MSG_STATUS_CODE + this.status;
					callback(result);
				}
			} else {
				var result = {};
				result.success = false;
				result.message = e.error;
				callback(result);
			}
		};
		httpClient.onerror = function(e) {
			var result = {};
			result.success = false;
			Ti.API.info('e.error ' + e.error);
			if (e.error == 'HTTP error') {
				result.message = Alloy.Globals.Constants.UNABLE_TO_CONNECT;
			} else {
				result.message = e.error;
			}
			callback(result);
		};

		// Send the request data.
		try {
			httpClient.open('POST', url);
			// httpClient.setRequestHeader("Content-Type", "multipart/form-data");
			Ti.API.info('*****************web service call - timestamp: ' + new Date() + '*********************');

			httpClient.send({
				email : data.email,
				user_id : data.user_id,
				fullname : data.fullname,
				gender : data.gender,
				phone_number : data.phone_number,
				date_of_birth : data.date_of_birth,
				address : data.address,
				state : data.state,
				city : data.city,
				zip : data.zip,
				deviceType : data.deviceType,
				profile_pic : ProfileImage,
				default_CardDetails : JSON.stringify(data.default_CardDetails),
				remove_profile_pic : data.remove_profile_pic
			});
		} catch(e) {
			Alloy.Globals.toast(e.message);
			tracker.addException({
				description : "Communicator => postProfileImage: " + e.message,
				fatal : false
			});
		}

	} else {

		var result = {};
		result.success = false;
		var MSG_NO_NETWORK = Alloy.Globals.Constants.MSG_NO_NETWORK;
		result.message = MSG_NO_NETWORK;
		callback(result);

	}
};

exports.postLeadData = function(url, data, ProfileImage, callback) {
	if (Titanium.Network.online) {
		// Create an HTTPClient.
		var httpClient = Ti.Network.createHTTPClient();
		httpClient.setTimeout(30000);

		// Define the callback.
		httpClient.onload = function(e) {
			Ti.API.info('*****************web service response - timestamp:5 ' + new Date() + '*********************');

			if (e.success) {
				if (this.status == 200) {

					if (this.responseText != null && this.responseText.trim().length > 0) {
						var result = {};
						result.success = true;
						result.response = this.responseText;
						callback(result);
					} else {
						var result = {};
						result.success = false;
						var MSG_NO_DATA = Alloy.Globals.Constants.MSG_NO_DATA;
						result.message = MSG_NO_DATA;
						callback(result);
					}
				} else {
					var result = {};
					result.success = false;
					var MSG_STATUS_CODE = Alloy.Globals.Constants.MSG_STATUS_CODE;
					result.message = MSG_STATUS_CODE + this.status;
					callback(result);
				}
			} else {
				var result = {};
				result.success = false;
				result.message = e.error;
				callback(result);
			}
		};
		httpClient.onerror = function(e) {
			var result = {};
			result.success = false;
			Ti.API.info('e.error ' + e.error);
			if (e.error == 'HTTP error') {
				result.message = Alloy.Globals.Constants.UNABLE_TO_CONNECT;
			} else {
				result.message = e.error;
			}
			callback(result);
		};

		// Send the request data.
		try {
			httpClient.open('POST', url);

			Ti.API.info('*****************web service call - timestamp: ' + new Date() + '*********************');

			httpClient.send({
				LoginToken : data.LoginToken,
				FirstName : data.FirstName,
				LastName : data.LastName,
				Email : data.Email,
				//VehicleId : data.VehicleId,
				//Make : data.make,
				//Model : data.model,
				PostCode : data.PostCode,
				Mobile : data.Mobile,
				LeadId : data.LeadId,
				Image : ProfileImage,
				DealershipId : data.selectedDealer,
				ServiceCustomer : data.serviceUser,
				ValidPhone : data.validPhone,
				ValidEmail : data.validEmail,
			});
		} catch(e) {
			Alloy.Globals.toast(e.message);

		}

	} else {

		var result = {};
		result.success = false;
		var MSG_NO_NETWORK = Alloy.Globals.Constants.MSG_NO_NETWORK;
		result.message = MSG_NO_NETWORK;
		callback(result);

	}
};

exports.postImages = function(url, data, postImage, callback) {
	if (Titanium.Network.online) {
		// Create an HTTPClient.
		var httpClient = Ti.Network.createHTTPClient();
		httpClient.setTimeout(30000);

		// Define the callback.
		httpClient.onload = function(e) {
			Ti.API.info('*****************web service response - timestamp:6 ' + new Date() + '*********************');
			if (e.success) {
				if (this.status == 200) {

					if (this.responseText != null && this.responseText.trim().length > 0) {
						var result = {};
						result.success = true;
						result.response = this.responseText;
						callback(result);
					} else {
						var result = {};
						result.success = false;
						var MSG_NO_DATA = Alloy.Globals.Constants.MSG_NO_DATA;
						result.message = MSG_NO_DATA;
						callback(result);
					}
				} else {
					var result = {};
					result.success = false;
					var MSG_STATUS_CODE = Alloy.Globals.Constants.MSG_STATUS_CODE;
					result.message = MSG_STATUS_CODE + this.status;
					callback(result);
				}
			} else {
				var result = {};
				result.success = false;
				result.message = e.error;
				callback(result);
			}
		};
		httpClient.onerror = function(e) {
			var result = {};
			result.success = false;
			Ti.API.info('e.error ' + e.error);
			if (e.error == 'HTTP error') {
				result.message = Alloy.Globals.Constants.UNABLE_TO_CONNECT;
			} else {
				result.message = e.error;
			}
			callback(result);
		};

		// Send the request data.
		try {
			httpClient.open('POST', url);

			Ti.API.info('*****************web service call - timestamp: ' + new Date() + '*********************');

			httpClient.send({
				LoginToken : data.LoginToken,
				VehicleId : data.vehicleID,
				Type : data.Type,
				VehicleEvaluationId : data.evalID,
				Image : postImage,
			});
		} catch(e) {
			Alloy.Globals.toast(e.message);
		}

	} else {

		var result = {};
		result.success = false;
		var MSG_NO_NETWORK = Alloy.Globals.Constants.MSG_NO_NETWORK;
		result.message = MSG_NO_NETWORK;
		callback(result);

	}
};

