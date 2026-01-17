import Rule from './rule.js';
import Topcycle from './topcycle.js';

export default class Uncoveredeset extends Topcycle {

winners() {
    let winners = [];
    let visited;

    function update(u,n,p) {
        visited[u] = true;
        for (let v = 0; v < n; v++) {
            if (p[u][v]==1) {
                visited[v] = true;
                console.log(`visited ${v}`);
                for (let w = 0; w < n; w++) {
                    if (p[v][w]==1 && !visited[w]) {
                        visited[w] = true;
                        console.log(`visited ${w} by ${v}`);
                    }
                }
            }
        }
    }

    var uncovered;

    for (let i = 0; i < this.n_candidates; i++) {
        console.log(i)
        visited = new Array(this.n_candidates).fill(false);
        update(i, this.n_candidates,this.profile);
        console.log(visited)
        uncovered = true;
        let j = 0;
        while (j < this.n_candidates && uncovered) {
            uncovered = visited[j];
            j++;
        }
        console.log(uncovered)
        if (uncovered) { 
            winners.push(i)
        }
    }
    this._winners = winners;
    console.log(winners)
    return winners;
}


structure() {
    if (this.ms === undefined){
        this.ms = this.minimal_support();
    }
    function build_paths(root,n,ms){
        var paths = [];
        for (let i = 0; i < n; i++) {
            if (i!=root) {
                if (ms[root][i] === 1) {
                    paths.push([i]);
                } else {
                    var j = 0;
                    var found = false;
                    while (j<n && !found) {
                        if (ms[j][i] === 1) {
                            paths.push([j,i]);
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
    var structure = build_paths(this._focus,this.n_candidates,this.ms);
    this._structure = structure;
    //console.log(JSON.stringify(structure));
    return structure;
}


explanation() {
    this._structure = this.structure();
    //console.log(this._structure);
    let explanation = [];
    explanation.push(this._focus + " is an Uncovered Set winner because: ");

    function explain_path(root, path){
        if (path.length==0) {

        } else {
            if (path.length==1) {
                explanation.push("- " + root + " is not covered by " + path[0] + " as " + root + " is preferred over " + path[0]);
            } else {
                if (path.length==2) {
                    explanation.push("- " + root + " is not covered by " + path[1] + " as " + root + " is preferred over " + path[0] + " and " + path[1] + " is not preferred to " + path[0]);
                } else {
                    console.log("Uncoveredset error: structure is ill-formed");
                }
            }
        }
    }

    for (let i=0; i<this.n_candidates; i++) {
        explain_path(this._focus, this._structure[i]);
    }
    this._explanation = explanation;
    //console.log(this._explanation);
    return explanation; 
}
}
