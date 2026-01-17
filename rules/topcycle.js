import Rule from './rule.js';

export default class Topcycle extends Rule{


winners() {
    let visited = new Array(this.n_candidates).fill(false);
    let stack = [];

    // Step 1: Perform DFS on the original graph and fill the stack
    function dfs(u,n,p) {
        visited[u] = true;
        for (let v = 0; v < n; v++) {
            if (p[u][v] && !visited[v]) {
                dfs(v,n,p);
            }
        }
        stack.push(u);
    }

    // Perform DFS on all nodes to ensure all are visited
    for (let i = 0; i < this.n_candidates; i++) {
        //console.log(i);
        if (!visited[i]) {
            //console.log("DFS visit node: " + i);
            dfs(i, this.n_candidates,this.profile);
        }
    }
    
    // Step 2: Transpose the adjacency matrix
    const transposedMatrix = new Array(this.n_candidates).fill().map(() => new Array(this.n_candidates).fill(0));
    for (let i = 0; i < this.n_candidates; i++) {
        for (let j = 0; j < this.n_candidates; j++) {
            transposedMatrix[i][j] = this.profile[j][i];
        }
    }

    // Step 3: Perform DFS on the transposed graph in the order defined by the stack
    visited = new Array(this.n_candidates).fill(false);
    let scc = [];

    function dfsTransposed(u,n,p) {
        visited[u] = true;
        scc.push(u);
        for (let v = 0; v < n; v++) {
            if (p[u][v] && !visited[v]) {
                dfsTransposed(v,n,p);
            }
        }
    }

    // Process nodes in the order defined by the stack
    while (stack.length > 0) {
        const u = stack.pop();
        if (!visited[u]) {
            scc = [];
            dfsTransposed(u, this.n_candidates, transposedMatrix);
            // Return the first SCC found, which is the topmost one
            this._winners = scc;
            return scc;
        }
    }
    scc = scc.sort();
    this._winners = scc;
    return scc; // Fallback (should not reach here for non-empty graphs)
}


minimal_support() {
    if (!this._winners){
        this._winners = this._winners(this.profile);
    }
    let ms = [...Array(this.n_candidates)].map(_=>Array(this.n_candidates).fill(0));
    let visited = new Array(this.n_candidates).fill(false);
    visited[this._focus] = true;
    let queue = [this._focus];
    while (queue.length > 0) {
        const u = queue.shift();
        for (let v = 0; v < this.n_candidates; v++) {
            if (this.profile[u][v] && !visited[v]) {
                visited[v] = true;
                ms[u][v] = 1;
                queue.push(v);
            }
        }
    }
    this.ms = ms;
    return ms;
}

structure() {
    if (this.ms === undefined){
        this.ms = this.minimal_support();
    }
    function build_tree(root,n,ms){
        var children = [];
        for (let i = 0; i < n; i++){
            if (ms[root][i] ===1) {
                children.push(build_tree(i,n,ms));
            }
        }
        return [root, children];
    }
    var structure = build_tree(this._focus,this.n_candidates,this.ms);
    this._structure = structure;
    return structure;
}

explanation() {
    this._structure = this.structure();
    //console.log(this._structure);
    let explanation = [];
    explanation.push(this._focus + " is a Top Cycle winner because: ");
    explanation.push("- eliminating " + this._focus + " would lead to an empty top cycle. Indeed eliminating " + this._focus + " would:");
    
    function explain_subtree(subtree,depth){
    var prefix = "";
    if (depth==0) {
        prefix = "- eliminate ";
    } else {
        for (let i=0; i<depth; i++) {
            prefix = prefix + "  ";
        }
        prefix = prefix + "- which would eliminate ";
    }
    for (let c in subtree[1]){
        explanation.push(prefix + subtree[1][c][0] + " because " + subtree[0] + " beats " + subtree[1][c][0]);
        explain_subtree(subtree[1][c], depth+1);
    }
    }
    explain_subtree(this._structure, 0);

    this._explanation = explanation;
    //console.log(this._explanation);
    return explanation; 
}
};
