import Rule from './rule.js';

export default class Borda extends Rule {

constructor(profile) {
    super(profile);
    this.n_voters = profile[0][1] + profile[1][0];
}


winners() {
    let scores = new Array(this.n_candidates).fill(0);

    for (let i=0; i< this.n_candidates; i++) {
        scores[i] = this.profile[i].reduce((partialSum, a) => partialSum + a, 0);
    }

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
    if (this._focus==0) {
        var min_mu = this.profile[this._focus][1];
    } else {
        var min_mu = this.profile[this._focus][0];
    }
    
    var sum = 0;
    for (let i=0; i<this.n_candidates; i++) {
        ms[this._focus][i] = this.profile[this._focus][i];
        sum = sum + this.profile[this._focus][i];
        if (i!=this._focus && this.profile[this._focus][i]<=min_mu) {
            min_mu = this.profile[this._focus][i];
        }
    }

    if (sum < this.n_voters*(this.n_candidates-1) - min_mu) {

        function argmax(l) {
            l.length;
            if (l.length == 0) {
                console.log("argmax error: empty list");
            } else {
                let max = l[0];
                var argmax = 0;
                for (let i=1; i<l.length; i++) {
                    if (l[i]>=max) {
                        max = l[i];
                        argmax = i;
                    } 
                }
            }
            return argmax;
        }

        let deltas = new Array(this.n_candidates).fill(sum - this.n_voters*(this.n_candidates-1));

        for (let i=0; i< this.n_candidates; i++) {
            if (i==this._focus) {
                deltas[i] = 0;
            } else {
                deltas[i] = deltas[i] + ms[this._focus][i];
            }
        }

        for (let i=0; i< this.n_candidates; i++) {
            if (i==this._focus) {
                
            } else {
                var resources = new Array(this.n_candidates).fill(0);
                for (let j=0; j< this.n_candidates; j++) {
                    if (j==this._focus) {
                        resources[j] = 0;
                    } else {
                        resources[j] = this.profile[j][i];
                    }
                }

                while (deltas[i] <0) {
                    let j = argmax(resources);
                    ms[j][i] = Math.min(-deltas[i], resources[j])
                    deltas[i] = deltas[i] + ms[j][i]
                    resources[j] = resources[j] - ms[j][i];
                }
            }
        }
    } else {

        function non_zero_argmin(l) {
            if (l.length <=1) {
                console.log("argmax error: list with one or less element");
            } else {
                var argmin = 0;
                while (l[argmin] == 0) {
                    argmin++;
                }
                var min = l[argmin];

                for (let i=argmin+1; i<l.length; i++) {
                    if (l[i]>0 && l[i]<=min) {
                        min = l[i];
                        argmin = i;
                    } 
                }
            }
            return argmin;
        }

        let actual = sum;
        let final =this.n_voters*(this.n_candidates-1) - Math.min(Math.floor(this.n_voters * (1 - 1 / this.n_candidates)), min_mu);
        let rm = actual - final;
        let rmed = 0;

        var resources = new Array(this.n_candidates).fill(0);
        for (let i=0; i< this.n_candidates; i++) {
            resources[i] = this.profile[this._focus][i];
        }

        while (rmed < rm) {
            let i = non_zero_argmin(resources);
            let iterm = Math.min(rm - rmed, sum - this.n_voters*(this.n_candidates-1) + ms[this._focus][i] - rm);
            ms[this._focus][i] = ms[this._focus][i] - iterm;
            rmed = rmed + iterm;
            resources[i] = 0;
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
    function build_neighborhood(w,n,ms){
        let neighborhoods = [...Array(n)].map(_=>[]);
        for (let i = 0; i < n; i++){
            if (i == w) {
                for (let j = 0; j < n; j++){
                    if (ms[w][j]!=0) {
                        neighborhoods[i].push([j,ms[w][j]]);
                    }
                }
            } else {
                for (let j = 0; j < n; j++){
                    if (ms[j][i]!=0) {
                        neighborhoods[i].push([j,ms[j][i]]);
                    }
                }
            }
        }
        return neighborhoods;
    }
    var structure = build_neighborhood(this._focus,this.n_candidates,this.ms);
    this._structure = structure;
    return structure;
}


explanation() {
    this._structure = this.structure();
    console.log(this._structure);

    function displaySum(l) {
        var text = "";
        if (l.length==0) {
            console.log("displaySum error: empty list")
        } else {
            text = text + l[0][1];
        }
        for (let i=1; i<l.length; i++) {
            if (l[i]!=0) {
                text = text + " + " + l[i][1];
            }
        }
        return text
    }

    let explanation = [];
    explanation.push(this._focus + " is a Borda winner because: ");
    let sum = this._structure[this._focus].reduce((partialSum, a) => partialSum + a[1], 0);
    explanation.push("- " + this._focus + " is preferred in at least " + sum + " = " + displaySum(this._structure[this._focus]) + " pairwise comparisons");
    
    function explain_losers(neighborhoods,w,n,m){
        const total = n*(m-1);
        for (let i=0; i<m; i++) {
            if (i!=w) {
                let sum = total - neighborhoods[i].reduce((partialSum, a) => partialSum + a[1], 0);
                if (neighborhoods[i].length == 1) {
                    explanation.push("- " + i + " is preferred in at most " + sum + " = " + total + " - " + displaySum(neighborhoods[i]) + " pairwise comparisons");
                } else {
                    explanation.push("- " + i + " is preferred in at most " + sum + " = " + total + " - (" + displaySum(neighborhoods[i]) + ") pairwise comparisons");
                }
            }
        }
    }

    explain_losers(this._structure,this._focus,this.n_voters,this.n_candidates);

    this._explanation = explanation;
    //console.log(this._explanation);
    return explanation; 
}
};
