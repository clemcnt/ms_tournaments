import Rule from './rule.js';

export default class Maximin extends Rule {

constructor(profile) {
    super(profile);
    this.n_voters = profile[0][1] + profile[1][0];
}


winners() {
    let scores = new Array(this.n_candidates).fill(0);

    function non_w_min(l,w) {
    if (l.length <=1) {
        console.log("non_w_min error: list with one or less element");
    } else {
        var i = 0;
        while (i==w) {
            i++;
        }
        var min = l[i];
        i++;
        while (i<l.length) {
            if (i!=w && l[i]<=min) {
                min = l[i];
            }
            i++;
        }
    }
    return min;
    }

    for (let i=0; i< this.n_candidates; i++) {
        scores[i] = non_w_min(this.profile[i],i);
    }
    console.log(JSON.stringify(scores));

    function argmaxl(l) {
        if (l.length == 0) {
            console.log("argmax error: empty list");
        } else {
            let max = l[0];
            var argmax = [0];

            for (let i=1; i<l.length; i++) {
                if (l[i]>max) {
                    max = l[i];
                    argmax = [i];
                } else {
                    if (l[i]==max) {
                        argmax.push(i);
                    }
                }
            }
        }
        return argmax;
    }

    var winners = argmaxl(scores);
    this._winners = winners;
    return winners;
}


minimal_support() {
    if (!this._winners){
        this._winners = this._winners(this.profile);
    }
    let ms = [...Array(this.n_candidates)].map(_=>Array(this.n_candidates).fill(0));

    function non_w_min(l,w) {
    if (l.length <=1) {
        console.log("non_w_min error: list with one or less element");
    } else {
        var i = 0;
        while (i==w) {
            i++;
        }
        var min = l[i];
        i++;
        while (i<l.length) {
            if (i!=w && l[i]<=min) {
                min = l[i];
            }
            i++;
        }
    }
    return min;
    }
    
    var min_mu = non_w_min(this.profile[this._focus],this._focus);
    const t = Math.min(min_mu, Math.floor(this.n_voters/2));

    for (let i=0; i< this.n_candidates; i++) {
        if (i!=this._focus) {
            if (this.profile[this._focus][i] >= this.n_voters - t) {
                ms[this._focus][i] = this.n_voters - t;
            } else {
                ms[this._focus][i] = t;
                let j=0;
                let found = false;
                while (!found && j<this.n_candidates) {
                    if (this.profile[j][i] >= this.n_voters - t) {
                        ms[j][i] = this.n_voters - t;
                        found = true;
                    }
                    j++;
                }
            }
        }
    }

    this.ms = ms;
    console.log(JSON.stringify(ms));
    return ms;
}

structure() {
    if (this.ms === undefined){
        this.ms = this.minimal_support();
    }

    function non_w_min(l,w) {
    if (l.length <=1) {
        console.log("non_w_min error: list with one or less element");
    } else {
        var i = 0;
        while (i==w) {
            i++;
        }
        var min = l[i];
        i++;
        while (i<l.length) {
            if (i!=w && l[i]<=min) {
                min = l[i];
            }
            i++;
        }
    }
    return min;
    }

    function build_neighborhood(w,ms,n,m){
        const t = Math.min(non_w_min(ms[w],w), Math.floor(n/2));
        let neighborhoods = [...Array(m)].map(_=>[]);
        for (let i = 0; i < m; i++){
            if (i == w) {
                for (let j = 0; j < m; j++){
                    if (j!=w) {
                        neighborhoods[i].push([j,ms[w][j]]);
                    }
                }
            } else {
                for (let j = 0; j < m; j++){
                    if (ms[j][i]!=0 && (j!=w || ms[j][i] >= n - t)) {
                        neighborhoods[i].push([j,ms[j][i]]);
                    }
                }
            }
        }
        return neighborhoods;
    }

    var structure = build_neighborhood(this._focus,this.ms,this.n_voters,this.n_candidates);
    this._structure = structure;
    return structure;
}


explanation() {
    this._structure = this.structure();
    console.log(this._structure);

    let explanation = [];
    explanation.push(this._focus + " is a Maximin winner because: ");
    console.log(JSON.stringify(this._structure));
    let min = Math.min(...this._structure[this._focus][1]);
    console.log(min);

    function displayMin(l) {
        var text = "min(";
        if (l.length == 0) {
            console.log("displayMin error: empty list")
        } else {
            text = text + l[0][1];
            for (let i=1; i<l.length; i++) {
                text = text + ", " + l[i][1];
            }
        return text + ")"
        }
    }

    explanation.push("- " + this._focus + " wins at least " + min + " = " + displayMin(this._structure[this._focus]) + " pairwise comparisons in each head-to-head");
    
    function explain_losers(neighborhoods,w,n,m){
        for (let i=0; i<m; i++) {
            if (i!=w) {
                explanation.push("- " + i + " wins at most " + (n - neighborhoods[i][0][1]) + " = " + n + " - " + neighborhoods[i][0][1] + " pairwise comparisons against " + neighborhoods[i][0][0]);
            }
        }
    }

    explain_losers(this._structure,this._focus,this.n_voters,this.n_candidates);

    this._explanation = explanation;
    //console.log(this._explanation);
    return explanation; 
}
};
