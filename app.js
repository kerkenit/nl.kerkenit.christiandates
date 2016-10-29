/* global Homey, module */
(function() {
	'use strict';
}());
var init = function() {
		Homey.log("Jesus he knows me and he knows I'm right. I've been talking to Jesus all my life");
	};
Date.prototype.addDays = function(days) {
	var dat = new Date(this.valueOf());
	dat.setDate(dat.getDate() + days);
	return dat;
};
Date.prototype.addWeeks = function(weeks) {
	return this.addDays(weeks * 7);
};
Date.prototype.vigil = function(vigil, hour) {
	if (vigil) {
		var settings = Homey.manager('settings').get('settings');
		if (settings !== null && settings.vigil !== null && settings.vigil === true) {
			this.setDate(new Date(this.valueOf()).getDate() - 1);
			this.setHours(18, 0, 0, 0);
		} else {
			this.setHours(0, 0, 0, 0);
		}
	} else if (hour !== undefined && hour !== null) {
		if (hour === 0) {
			this.setHours(0, 0, 0, 0);
		} else {
			this.setHours(hour, 0, 0, 0);
		}
	}
	return this;
};
module.exports.init = init;
var match = {
	today: new Date(),
	matchDate: null,
	vigil: false,
	vigilDate: function(hour) {
		matchDate.vigil(this.vigil, hour);
		if (!this.vigil && hour === 0) {
			this.today.setHours(0, 0, 0, 0);
		}
	},
	condition: function(condition, matchDate, vigil, hour) {
		this.matchDate = matchDate;
		this.vigil = vigil;
		this.vigil(hour);
		Homey.log(matchDate);
		switch (condition) {
		case '>':
			if (this.today > matchDate) {
				return true;
			}
			break;
		case '<':
			if (this.today < matchDate) {
				return true;
			}
			break;
		case '>=':
			if (this.today >= matchDate) {
				return true;
			}
			break;
		case '<=':
			if (this.today <= matchDate) {
				return true;
			}
			break;
		case '===':
			if (this.today === matchDate) {
				return true;
			}
			break;
		case '!==':
			if (this.today !== matchDate) {
				return true;
			}
			break;
		default:
			Homey.log(condition);
			return false;
		}
		return false;
	},
	between: function(start, end) {
		Homey.log({
			'start': start,
			'end': end
		});
		return (this.start >= this.today && end <= this.today);
	}
};
var calendar = {
	year: (new Date()).getFullYear(),
	christmas: function() {
		return new Date(this.year, 12 - 1, 25);
	},
	advent: function() {
		var advent = this.christmas().getTime() - (((3 * 7) + 1) * (60 * 60 * 24 * 1000));
		while (((new Date(advent)).getDay() % 7) !== 0) {
			advent -= (60 * 60 * 24 * 1000);
		}
		return new Date(advent);
	},
	epiphany: function() {
		var epiphany = new Date(this.year, 1 - 1, 2).getTime();
		while (((new Date(epiphany)).getDay() % 7) !== 0) {
			epiphany += (60 * 60 * 24 * 1000);
		}
		return new Date(epiphany);
	},
	easter: function() {
		var C = Math.floor(this.year / 100);
		var N = this.year - 19 * Math.floor(this.year / 19);
		var K = Math.floor((C - 17) / 25);
		var I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
		I = I - 30 * Math.floor((I / 30));
		I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
		var J = this.year + Math.floor(this.year / 4) + I + 2 - C + Math.floor(C / 4);
		J = J - 7 * Math.floor(J / 7);
		var L = I - J;
		var M = 3 + Math.floor((L + 40) / 44);
		var D = L + 28 - 31 * Math.floor(M / 4);
		return new Date(this.year, M - 1, D);
	},
	pentecost: function() {
		return this.easter().addDays(49);
	}
};
// this is fired when a flow with this trigger has been found
Homey.manager('flow').on('condition.isAdvent', function(callback, args, state) {
	callback(null, match.between(calendar.advent().vigil(true), calendar.christmas().vigil(true)));
});
Homey.manager('flow').on('condition.isChristmas', function(callback, args, state) {
	callback(null, match.between(calendar.christmas().vigil(true), calendar.epiphany()));
});
Homey.manager('flow').on('condition.isLent', function(callback, args, state) {
	callback(null, match.between(calendar.easter().addDays(-46).vigil(false), calendar.easter().vigil(true)));
});
Homey.manager('flow').on('condition.isEaster', function(callback, args, state) {
	callback(null, match.between(calendar.easter().vigil(true), calendar.pentecost().addDays(1)));
});
Homey.manager('flow').on('condition.Advent_1', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.advent()));
});
Homey.manager('flow').on('condition.Advent_2', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.advent().addWeeks(1), true, 0));
});
Homey.manager('flow').on('condition.Advent_3', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.advent().addWeeks(2), true, 0));
});
Homey.manager('flow').on('condition.Advent_4', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.advent().addWeeks(3), true, 0));
});
Homey.manager('flow').on('condition.ChristmasEve', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.christmas().addDays(-1), false, 16));
});
Homey.manager('flow').on('condition.Christmas', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.christmas(), false, 0));
});
Homey.manager('flow').on('condition.SecondDayOfChristmas', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.christmas(), false, 0));
});
Homey.manager('flow').on('condition.Epiphany', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.epiphany(), true, 0));
});
Homey.manager('flow').on('condition.PalmSunday', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.easter().addDays(-7), true, 0));
});
Homey.manager('flow').on('condition.HolyThursday', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.easter().addDays(-3), false, 0));
});
Homey.manager('flow').on('condition.GoodFriday', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.easter().addDays(-2), false, 0));
});
Homey.manager('flow').on('condition.Easter', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.easter(), false, 0));
});
Homey.manager('flow').on('condition.Pentecost', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.easter(), false, 0));
});