export default class {

	constructor(name) {
		this.name = name;
		this.message = " is 40 years old.";
	}

	set Message(name) {
		this.name = name;
	}

	get Message() {
		return this.name + this.message;
	}

	showMessage = function () {
		return this.name + this.message;
	}

}