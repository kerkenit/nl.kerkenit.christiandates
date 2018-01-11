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
		var today = new Date();
		today.setHours(0, 0, 0, 0);
		this.setHours(0, 0, 0, 0);
		if (this.getTime() !== today.getTime()) {
			var settings = Homey.manager('settings').get('settings');
			if (settings !== undefined && settings !== null && settings.vigil !== undefined && settings.vigil !== null && settings.vigil === true) {
				this.setDate(new Date(this.valueOf()).getDate() - 1);
				this.setHours(17, 0, 0, 0);
			}
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
	condition: function(condition, matchDate) {
		Homey.log(matchDate);
		switch (condition) {
		case '>':
			if (this.today < matchDate) {
				return true;
			}
			break;
		case '<':
			if (this.today > matchDate) {
				return true;
			}
			break;
		case '>=':
			this.today.setHours(0, 0, 0, 0);
			matchDate.setHours(0, 0, 0, 0);
			if (this.today <= matchDate) {
				return true;
			}
			break;
		case '<=':
			if (this.today >= matchDate) {
				return true;
			}
			break;
		case '==':
		case '===':
			this.today.setHours(0, 0, 0, 0);
			matchDate.setHours(0, 0, 0, 0);
			if (this.today.getTime() === matchDate.getTime()) {
				return true;
			}
			break;
		case '!=':
		case '!==':
			this.today.setHours(0, 0, 0, 0);
			matchDate.setHours(0, 0, 0, 0);
			if (this.today.getTime() !== matchDate.getTime()) {
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
			'end': end,
			'after': this.today.getTime() >= start.getTime(),
			'before': this.today.getTime() <= end.getTime()
		});
		return (this.today >= start && this.today <= end);
	}
};
var calendar = {
	today: new Date(),
	year: (new Date()).getFullYear(),
	month: (new Date()).getMonth() + 1,
	isFeastDay: function() {
		if (match.condition('===', this.christmas())) { // First Christmas day = 1e Kerstdag
			return true;
		} else if (match.condition('===', this.christmas().addDays(1))) { // Second Christmas day = 2e Kerstdag
			return true;
		} else if (match.condition('===', this.easter())) { // First Easter day = 1e Paadag
			return true;
		} else if (match.condition('===', this.easter().addDays(1))) { // Second Easter day = 2e Paadag
			return true;
		} else if (match.condition('===', this.ascension())) { // Ascension = Hemelvaartsdag
			return true;
		} else if (match.condition('===', this.pentecost())) { // Pentecost = Pinksteren
			return true;
		} else if (match.condition('===', this.assumptionOfMary())) { // Assumption of Mary = Maria-Tenhemelopneming
			return true;
		} else if (match.condition('===', this.allSaintsDay())) { // All Saints' Day = Allerheiligen
			return true;
		} else {
			return false;
		}
	},
	isSunday: function() {
		return this.today.getDay() === 0;
	},
	christmas: function(vigil) {
		var year = this.year;
		if (this.month === 1 || this.month === 2 || this.epiphany >= this.today) {
			year = this.year - 1;
		}
		return new Date(year, (12 - 1), 25).vigil(vigil);
	},
	advent: function(vigil) {
		var advent = this.christmas().getTime() - (((3 * 7) + 1) * (60 * 60 * 24 * 1000));
		while (((new Date(advent)).getDay() % 7) !== 0) {
			advent -= (60 * 60 * 24 * 1000);
		}
		return new Date(advent).vigil(vigil);
	},
	epiphany: function(vigil) {
		var epiphany = new Date((this.month >= 11 ? (this.year + 1) : this.year), 0, 2).getTime();
		while (((new Date(epiphany)).getDay() % 7) !== 0) {
			epiphany += (60 * 60 * 24 * 1000);
		}
		return new Date(epiphany).vigil(vigil);
	},
	candlemas: function(vigil) {
		return this.christmas().addDays(40).vigil(vigil);
	},
	easter: function(vigil) {
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
		return new Date(this.year, M - 1, D).vigil(vigil);
	},
	ascension: function(vigil) {
		return this.easter().addDays(39).vigil(vigil);
	},
	pentecost: function(vigil) {
		return this.easter().addDays(49).vigil(vigil);
	},
	assumptionOfMary: function(vigil) {
		var year = this.year;
		return new Date(year, (8 - 1), 15).vigil(vigil);
	},
	allSaintsDay: function(vigil) {
		var year = this.year;
		return new Date(year, (11 - 1), 1).vigil(vigil);
	},
};
// this is fired when a flow with this trigger has been found
Homey.manager('flow').on('condition.isAdvent', function(callback, args, state) {
	callback(null, match.between(calendar.advent(true), calendar.christmas(true)));
});
Homey.manager('flow').on('condition.isChristmas', function(callback, args, state) {
	callback(null, match.between(calendar.christmas(true), calendar.epiphany(false)));
});
Homey.manager('flow').on('condition.isLent', function(callback, args, state) {
	callback(null, match.between(calendar.easter(false).addDays(-46), calendar.easter(true)));
});
Homey.manager('flow').on('condition.isEaster', function(callback, args, state) {
	callback(null, match.between(calendar.easter(true), calendar.pentecost(false).addDays(2)));
});
Homey.manager('flow').on('condition.Advent_1', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.advent(true)));
});
Homey.manager('flow').on('condition.Advent_2', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.advent(true).addWeeks(1)));
});
Homey.manager('flow').on('condition.Advent_3', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.advent(true).addWeeks(2)));
});
Homey.manager('flow').on('condition.Advent_4', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.advent(true).addWeeks(3)));
});
Homey.manager('flow').on('condition.ChristmasEve', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.christmas(false).addDays(-1).vigil(false, 16)));
});
Homey.manager('flow').on('condition.Christmas', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.christmas(false)));
});
Homey.manager('flow').on('condition.SecondDayOfChristmas', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.christmas(false).addDays(1)));
});
Homey.manager('flow').on('condition.Epiphany', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.epiphany(false)));
});
Homey.manager('flow').on('condition.Candlemas', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.candlemas(false)));
});
Homey.manager('flow').on('condition.PalmSunday', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.easter(true).addDays(-7)));
});
Homey.manager('flow').on('condition.HolyThursday', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.easter(false).addDays(-3)));
});
Homey.manager('flow').on('condition.GoodFriday', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.easter(false).addDays(-2)));
});
Homey.manager('flow').on('condition.Easter', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.easter(false)));
});
Homey.manager('flow').on('condition.Ascension', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.ascension(true)));
});
Homey.manager('flow').on('condition.Pentecost', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.pentecost(true)));
});
Homey.manager('flow').on('condition.AssumptionOfMary', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.assumptionOfMary(true)));
});
Homey.manager('flow').on('condition.AllSaintsDay', function(callback, args, state) {
	callback(null, match.condition(args.condition, calendar.allSaintsDay(true)));
});
Homey.manager('flow').on('condition.isFeastDay', function(callback) {
	callback(null, calendar.isFeastDay());
});
Homey.manager('flow').on('condition.isSunday', function(callback) {
	if (calendar.isFeastDay()) {
		callback(null, true);
	} else {
		callback(null, calendar.isSunday());
	}
});