export default class Rule {

constructor(profile) {
    this.profile = profile;
    this.n_candidates = profile.length;
    this._winners = undefined;
    this._focus = undefined;
    this._structure = undefined;
    this.ms = undefined;
    this._explanation = undefined;
}


winners() {
    console.log("winners error: winners is not defined for the current rule")
    return false; 
}

focus(w) {
    if (!this._winners){
        this._winners = this._winners(this.profile);
    }
    if (this._winners.includes(w)){
        this._focus = w;
        return w;
    } else {
        return console.error("focus error: " + w + " is not in the winner set");
    }
}

minimal_support() {
    console.log("minimal_support error: minimal_support is not defined for the current rule")
    return false; 
}

structure() {
    console.log("structure error: structure is not defined for the current rule")
    return false; 
}

explanation() {
    console.log("explanation error: explanation is not defined for the current rule")
    return false; 
}
};
