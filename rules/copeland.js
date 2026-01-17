import Rule from './rule.js';
import Borda from './borda.js';

export default class Copeland extends Borda {

constructor(profile) {
    super(profile);
    this.n_voters = profile[0][1] + profile[1][0];
    if (this.n_voters!=1) {
        console.log("Copeland error: Copeland can only be used with (unweighted) tournaments")
    }
}

explanation() {
    this._structure = this.structure();
    console.log(this._structure);

    function displaySum(l) {
        var text = "";
        if (l.length == 0) {
            console.log("displaySum error: empty list")
        } else {
            text = text + l[0];
        }
        for (let i=1; i<l.length; i++) {
            if (l[i]!=0) {
                text = text + " + " + l[i];
            }
        }
        return text
    }

    let explanation = [];
    explanation.push(this._focus + " is a Copeland winner because: ");
    let sum = this._structure[this._focus].reduce((partialSum, a) => partialSum + a[1], 0);
    explanation.push("- " + this._focus + " is preferred in at least " + sum + " head-to-heads");
    
    function explain_losers(neighborhoods,w,n,m){
        const total = n*(m-1);
        for (let i=0; i<m; i++) {
            if (i!=w) {
                let sum = neighborhoods[i].reduce((partialSum, a) => partialSum + a[1], 0);
                explanation.push("- " + i + " is preferred in at most " + (total-sum) + " = " + total + " - " + sum + " head-to-heads");
            }
        }
    }

    explain_losers(this._structure,this._focus,this.n_voters,this.n_candidates);

    this._explanation = explanation;
    //console.log(this._explanation);
    return explanation; 
}
}