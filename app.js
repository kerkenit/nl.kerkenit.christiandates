(function() {
	'use strict';
}());

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
			var settings = Homey.ManagerSettings.get('vigil', ( err, result ) => {
				if( err ) return;
				this.setDate(new Date(this.valueOf()).getDate() - 1);
				this.setHours(17, 0, 0, 0);
			});
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


const Homey = require('homey');

class ChristianDates extends Homey.App {

	onInit() {
    this.log("Jesus he knows me and he knows I'm right. I've been talking to Jesus all my life");
  }
}

var match = {
	today: new Date(),
	condition: function(condition, matchDate) {
		console.log(matchDate);
		switch (condition) {
		case '>':
			if (this.today.getTime() > matchDate.getTime()) {
				return true;
			}
			break;
		case '<':
			if (this.today.getTime() < matchDate.getTime()) {
				return true;
			}
			break;
		case '>=':
			this.today.setHours(0, 0, 0, 0);
			matchDate.setHours(0, 0, 0, 0);
			if (this.today.getTime() >= matchDate.getTime()) {
				return true;
			}
			break;
		case '<=':
			if (this.today.getTime() <= matchDate.getTime()) {
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
			console.log(condition);
			return false;
		}
		return false;
	},
	between: function(start, end) {
		console.log({
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


let isAdvent = new Homey.FlowCardCondition('isAdvent');
isAdvent.register().registerRunListener((args, state) => {
	return Promise.resolve(match.between(calendar.advent(true), calendar.christmas(true)));
});
let isChristmas = new Homey.FlowCardCondition('isChristmas');
isChristmas.register().registerRunListener((args, state) => {
	return Promise.resolve(match.between(calendar.christmas(true), calendar.epiphany(false)));
});
let isLent = new Homey.FlowCardCondition('isLent');
isLent.register().registerRunListener((args, state) => {
	return Promise.resolve(match.between(calendar.easter(false).addDays(-46), calendar.easter(true)));
});
let isEaster = new Homey.FlowCardCondition('isEaster');
isEaster.register().registerRunListener((args, state) => {
	return Promise.resolve(match.between(calendar.easter(true), calendar.pentecost(false).addDays(2)));
});
let Advent_1 = new Homey.FlowCardCondition('Advent_1');
Advent_1.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.advent(true)));
});
let Advent_2 = new Homey.FlowCardCondition('Advent_2');
Advent_2.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.advent(true).addWeeks(1)));
});
let Advent_3 = new Homey.FlowCardCondition('Advent_3');
Advent_3.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.advent(true).addWeeks(2)));
});
let Advent_4 = new Homey.FlowCardCondition('Advent_4');
Advent_4.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.advent(true).addWeeks(3)));
});
let ChristmasEve = new Homey.FlowCardCondition('ChristmasEve');
ChristmasEve.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.christmas(false).addDays(-1).vigil(false, 16)));
});
let Christmas = new Homey.FlowCardCondition('Christmas');
Christmas.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.christmas(false)));
});
let SecondDayOfChristmas = new Homey.FlowCardCondition('SecondDayOfChristmas');
SecondDayOfChristmas.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.christmas(false).addDays(1)));
});
let Epiphany = new Homey.FlowCardCondition('Epiphany');
Epiphany.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.epiphany(false)));
});
let Candlemas = new Homey.FlowCardCondition('Candlemas');
Candlemas.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.candlemas(false)));
});
let PalmSunday = new Homey.FlowCardCondition('PalmSunday');
PalmSunday.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.easter(true).addDays(-7)));
});
let HolyThursday = new Homey.FlowCardCondition('HolyThursday');
HolyThursday.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.easter(false).addDays(-3)));
});
let GoodFriday = new Homey.FlowCardCondition('GoodFriday');
GoodFriday.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.easter(false).addDays(-2)));
});
let Easter = new Homey.FlowCardCondition('Easter');
Easter.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.easter(false)));
});
let Ascension = new Homey.FlowCardCondition('Ascension');
Ascension.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.ascension(true)));
});
let Pentecost = new Homey.FlowCardCondition('Pentecost');
Pentecost.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.pentecost(true)));
});
let AssumptionOfMary = new Homey.FlowCardCondition('AssumptionOfMary');
AssumptionOfMary.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.assumptionOfMary(true)));
});
let AllSaintsDay = new Homey.FlowCardCondition('AllSaintsDay');
AllSaintsDay.register().registerRunListener((args, state) => {
	return Promise.resolve(match.condition(args.condition, calendar.allSaintsDay(true)));
});
let isFeastDay = new Homey.FlowCardCondition('isFeastDay');
isFeastDay.register().registerRunListener((args, state) => {
	return Promise.resolve(calendar.isFeastDay());
});
let isSunday = new Homey.FlowCardCondition('isSunday');
isSunday.register().registerRunListener((args, state) => {
	return Promise.resolve(calendar.isFeastDay() || calendar.isSunday());
});

module.exports = ChristianDates;