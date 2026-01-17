import Rule from './rule.js';
import { Model } from "https://cdn.jsdelivr.net/npm/lp-model@0.2.1/dist/lp-model.es.min.js";
//import { Module } from "https://cdn.jsdelivr.net/npm/highs/build/highs.js";

export default class Weighteduncoveredset extends Rule {

constructor(profile) {
    super(profile);
    this.n_voters = profile[0][1] + profile[1][0];
}


winners() {
    let winners = [];
    let visited;

    function update(w,p,n,m) {
        visited[w] = true;
        for (let i = 0; i < m; i++) {
            if (!visited[i]) {
                if (p[w][i] >= Math.ceil(n/2)) {
                    visited[i] = true;
                } else {
                    let j = 0; 
                    while (j < m && !visited[i]) {
                        if (p[w][j] + p[j][i] >= n+1) {
                            visited[i] = true;
                        }
                        j++;
                    }
                }
            }
        }
    }

    var uncovered;

    for (let i = 0; i < this.n_candidates; i++) {
        visited = new Array(this.n_candidates).fill(false);
        update(i, this.profile, this.n_voters, this.n_candidates,);
        uncovered = true;
        let j = 0;
        while (j < this.n_candidates && uncovered) {
            uncovered = visited[j];
            j++;
        }
        if (uncovered) { 
            winners.push(i)
        }
    }
    this._winners = winners;
    return winners;
}

async minimal_support() {
    const model = new Model();

    var ms_entries_name = [...Array(this.n_candidates)].map(_=>[]);
    
    for (let i=0; i<this.n_candidates; i++) {
        for (let j=0; j<this.n_candidates; j++) {
            ms_entries_name[i].push("ms"+i+j);
        }
    }

    var paths = [...Array(this.n_candidates)].map(_=>[]);
    
    for (let i=0; i<this.n_candidates; i++) {
        for (let j=0; j<this.n_candidates; j++) {
            paths[i].push("path"+i+j);
        }
    }

    var entries = [...Array(this.n_candidates)].map(_=>[]);
    var used = [];
    for (let i=0; i<this.n_candidates; i++) {
        // make binary variables for each path
        let temp = model.addVars(paths[i], {vtype: "BINARY"});
        console.log(temp);
        used.push(paths[i].map((j) => temp[j]));
        console.log(used);

        // make variables for each entry of ms
        for (let j=0; j<this.n_candidates; j++) {
            entries[i][j] = model.addVar({name: ms_entries_name[i][j], vtype: "INTEGER", lb: 0, ub: this.profile[i][j]});   
        }
    }
        
    for (let i=0; i<this.n_candidates; i++) {
        // only one path per candidate
        model.addConstr(used[i], "=", 1); 
        // used[i][i] can always be set to 1 freely
        // forcing equality to 2, forces another used[i][j] to be 1

        for (let j=0; j<this.n_candidates; j++) {
            // link used and entries for candidate i, used[j][i] = 1 iff ms[i][j]>0
            console.log(entries[i][j]);
            console.log(used[j][i]);
            model.addConstr([entries[i][j]], "<=", [[this.n_voters, used[j][i]]]);

            // path must either be mu(w,c) >= ceil(n/2) or mu(w,c') + mu(c',c) >= n+1
            // constraint only binding when used[c'][c]=1
            if (i!=this._focus && j!=this._focus) {
                model.addConstr([entries[this._focus][j], entries[j][i]], ">=", [[(this.n_voters+1), used[i][j]]]);
            }
        }
        if (i!=this._focus) {
            model.addConstr([entries[this._focus][i]], ">=", [[Math.ceil(this.n_voters/2), used[i][this._focus]]]);
        }
    }

    // minmize sum of entries of ms 
    // model.setObjective(entries.flat(), "MINIMIZE");
    // Add a second constraint with a small delta to maximize the weight of the w out-edges in case of equality in the sum of entries
    model.setObjective(entries.flat().concat(entries[this._focus].map((i) => [-1/(this.n_candidates+1), i])), "MINIMIZE");
    console.log(model.toLPFormat());

    const highs = await Module();
    await model.solve(highs);
    
    console.log(JSON.stringify(entries))
    let ms = entries.map((l) => (l.map((ll) => ll["value"])));
    this.ms = ms;
    console.log(JSON.stringify(ms));
    return ms;
}

async structure() {
    if (this.ms === undefined){
        this.ms = await this.minimal_support();
    }
    
    function build_paths(root,ms,n,m){
        var paths = [];
        for (let i = 0; i < m; i++) {
            if (i!=root) {
                if (ms[root][i] >= Math.ceil(n/2)) {
                    paths.push([ms[root][i]]);
                } else {
                    var j = 0;
                    var found = false;
                    while (j<m && !found) {
                        if (j!=root && ms[j][i] > 0) {
                            paths.push([j,ms[root][j],ms[j][i]]);
                            found = true;
                        }
                        j++;
                    }
                }
            } else {
                paths.push([]);
            }
        }
        return paths;
    }
    console.log(JSON.stringify(this.ms));
    var structure = build_paths(this._focus,this.ms,this.n_voters,this.n_candidates);
    this._structure = structure;
    console.log(JSON.stringify(structure));
    return structure;
}


async explanation() {
    this._structure = await this.structure();
    //console.log(this._structure);
    let explanation = [];
    explanation.push(this._focus + " is a part of the Weighted Uncovered Set because: ");

    function explain_path(root, i,  path){
        if (path.length == 0) {

        } else {
            if (path.length == 1) {
                explanation.push("- " + root + " is not weighted covered by " + i + " as " + root + " is preferred by a strict majority over " + i);
            } else {
                if (path.length == 3) {
                    explanation.push("- " + root + " is not weighted covered by " + i + " as " + root + " is more stronly preferred over " + path[0] + " than " + i);
                } else {
                    console.log("Weighteduncoveredset error: structure is ill-formed");
                }
            }
        }
    }

    for (let i=0; i<this.n_candidates; i++) {
        explain_path(this._focus, i, this._structure[i]);
    }
    this._explanation = explanation;
    //console.log(this._explanation);
    return explanation; 
}
}
