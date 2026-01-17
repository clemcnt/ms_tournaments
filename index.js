import Rule from './rules/rule.js';
import Topcycle from './rules/topcycle.js';
import Uncoveredset from './rules/uncoveredset.js';
import Borda from './rules/borda.js';
import Copeland from './rules/copeland.js';
import Maximin from './rules/maximin.js';
import Weighteduncoveredset from './rules/weighteduncoveredset.js';

var n_candidates;
var n_voters;

const rules_name = ["Topcycle", "Uncovered Set", "Copeland Rule", "Borda Rule", "Maximin Rule", "Weighted Uncovered Set"];
const rules_id = ["tc", "uc", "co", "bo", "mm", "wuc"];
const rules_weighted = [false, false, false, true, true, true];
const n_rules = rules_id.length;

function createRuleChoice(){
    var old_rules_form = document.getElementById("rulesForm");
    var element = document.getElementById("rules");
    const form = document.createElement('form');
    form.setAttribute("id", "rulesForm");
    const fieldset = document.createElement("fieldset");
    fieldset.setAttribute("id", "ruleOptions");
    const legend = document.createElement('legend');
    legend.textContent ="Select a voting rule:";
    fieldset.appendChild(legend);

    let first = true;

    for (let i=0; i<n_rules; i++) {
        const container = document.createElement('div');
        container.id = rules_id[i];

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'rule';
        input.value = rules_id[i];
        const label = document.createElement('label');
        label.htmlFor = rules_id[i];
        label.textContent = rules_name[i];
        if (first) {
            input.checked = true;
            first = false;
        }
        container.appendChild(input);
        container.appendChild(label);
        fieldset.appendChild(container);
    }
    form.appendChild(fieldset);
    if (old_rules_form) {
        element.replaceChild(form, old_rules_form);
    } else {
        element.appendChild(form);
    }
}

createRuleChoice();

function candidateName(i) {
    let ACharCode = 65;
    let q = Math.floor(i/26);
    let r = i%26;
    if (q==0) {
        return String.fromCharCode(ACharCode+r);
    } else if (q<25) {
        return String.fromCharCode(ACharCode+q) + String.fromCharCode(ACharCode+r);
    } else {
        console.log("candidateName error: did not expect to have more than 676 candidates.")
        return `${i}`
    }
}

function createProfile(){
    var element = document.getElementById("profile");
    var old_profile_table = document.getElementById("profile_table");
    var table = document.createElement('table')
    table.setAttribute("id", "profile_table")
    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

    var row =document.createElement('tr')

    // cell 00
    var cell = document.createElement('TD');
    cell.width = 10; cell.height = 10;  cell.align = "center";
    cell.setAttribute("id",`00`);
    row.appendChild(cell);
    
    // remaining of first row
    for (var i=1; i<n_candidates+1; i++) {
        var cell = document.createElement('TD');
        cell.width = 10; cell.height = 10;  cell.align = "center";
        cell.setAttribute("id",`0${i}`);
        var text = document.createTextNode(candidateName(i-1));
        cell.appendChild(text);
        row.appendChild(cell);
    }
    tableBody.appendChild(row);

    // remaining rows
    for (var i=1; i<n_candidates+1; i++) {
        var row =document.createElement('tr')

        // first cell of the row
        var cell = document.createElement('TD');
        cell.width = 10; cell.height = 10;  cell.align = "center";
        cell.setAttribute("id",`${i}0`);
        var text = document.createTextNode(candidateName(i-1));
        cell.appendChild(text);
        row.appendChild(cell);

        // remainnig of the row
        for (var j=1; j<n_candidates+1; j++) {
            var cell = document.createElement('TD');
            cell.width = 10; cell.height = 10;  cell.align = "center";
            cell.setAttribute("id",`${i}${j}`);
            if (j==i) {
                // diagonal elements
                cell.style.backgroundColor = "gray";
            } else {
                var cell_field = document.createElement("input");
                cell_field.setAttribute("type","number");
                cell_field.setAttribute("min","0");
                cell_field.setAttribute("max",n_voters);
                cell_field.setAttribute("value","0");
                cell.appendChild(cell_field);
            }
            row.appendChild(cell);
        }
        tableBody.appendChild(row);
    }
    if (old_profile_table) {
        element.replaceChild(table, old_profile_table);
    } else {
        element.appendChild(table);
    }
    
    console.log("createProfile: field to specify the profile created");
}

function randomFill() {
    for (let i=1; i<n_candidates+1; i++){
        for (let j=i+1; j<n_candidates+1; j++){
            let value = Math.floor(Math.random()*(n_voters+1));
            let entry = document.getElementById(`${i}${j}`);
            entry.firstChild.value = value;
            let opposit = document.getElementById(`${j}${i}`);
            opposit.firstChild.value = n_voters - value;
        }
    }
}

document.getElementById("rdmFillBtn")
    .addEventListener("click", randomFill);

function updateRuleChoice(unweighted2weighted,weighted2unweighted){
    if (unweighted2weighted) {
        for (let i=0; i<n_rules; i++) {
            if (!rules_weighted[i]) {
                let old_rule_option = document.getElementById(rules_id[i]);
                let element = document.getElementById("ruleOptions");
                const container = document.createElement('div');
                container.id = rules_id[i];

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'rule';
                input.value = rules_id[i];
                const label = document.createElement('label');
                label.htmlFor = rules_id[i];            
                label.textContent = rules_name[i] + " (this rule only applies to weighted tournaments)";
                input.disabled='disabled';
                input.checked=false;

                container.appendChild(input);
                container.appendChild(label);
                if (old_rule_option) {
                element.replaceChild(container, old_rule_option);
                } else {
                    element.appendChild(container);
                }
            }
        }
        console.log("updateRuleCoice: change from an unweighted tournament to a weighted one completed")
    }
    if (weighted2unweighted) {
        for (let i=0; i<n_rules; i++) {
            if (!rules_weighted[i]) {
                let old_rule_option = document.getElementById(rules_id[i]);
                let element = document.getElementById("ruleOptions");
                const container = document.createElement('div');
                container.id = rules_id[i];

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'rule';
                input.value = rules_id[i];
                const label = document.createElement('label');
                label.htmlFor = rules_id[i];
                label.textContent = rules_name[i];

                container.appendChild(input);
                container.appendChild(label);
                if (old_rule_option) {
                element.replaceChild(container, old_rule_option);
                } else {
                    element.appendChild(container);
                }
            }
        }
        console.log("updateRuleCoice: change from a weighted tournament to an unweighted one completed")
    }
}


function updateDimensions() {
    if ((n_candidates == undefined || n_voters == undefined) || n_candidates != parseInt(document.getElementById("candidates").value) || n_voters != parseInt(document.getElementById("voters").value)) {
        console.log("updateDimensions: change in the dimensions detected");
        const weighted2unweighted = parseInt(document.getElementById("voters").value) == 1 && (n_voters != 1 && n_voters != undefined);
        const unweighted2weighted = parseInt(document.getElementById("voters").value) != 1 && (n_voters == 1 || n_voters == undefined);
        n_candidates = parseInt(document.getElementById("candidates").value);
        n_voters = parseInt(document.getElementById("voters").value);
        createProfile();
        updateRuleChoice(unweighted2weighted,weighted2unweighted);
    } else {
        console.log("updateDimensions: dimensions up to date");
    }
}

document.getElementById("createBtn")
    .addEventListener("click", updateDimensions);


let profile;

function checkProfile(profile){
    if (profile.length != n_candidates || profile.length == 0 || profile[0].length != n_candidates) {
        console.log("checkProfile error: The profile is not a #candidates*#candidate matrix.")
        return false;
    } else {
        var complete = true
        var i = 0;
        var j;
        while ( i<n_candidates && complete) {
            j = i+1;
            while ( j<n_candidates && complete) {
                complete = ((profile[i][j] + profile[j][i]) == n_voters);
                j++;
            }
            i++;
        }
    }
    if (!complete) {
        console.log("checkProfile error: The profile is not a complete #voters-weighted tournament,\n i.e., m[i][j] + m[j][i] = #voters.")
        return false;
    } else {
        return true;
    }
}

function loadProfile(){
    var temp_profile=[...Array(n_candidates)].map(_=>Array(n_candidates).fill(0));
    for (let i=0; i<n_candidates; i++) {
        for (let j=0; j<n_candidates; j++) {
            var cellID = `${i+1}${j+1}`;
            var cell = document.getElementById(cellID);
            if (i!=j)
            {
                var value = cell.firstChild.value;
                temp_profile[i][j]=parseInt(value);
            }
        }
    }
    //console.log(JSON.stringify(temp_profile));
    if (checkProfile(temp_profile)) {
        profile = temp_profile;
        console.log("loadProafile: profile loaded successfully")
        return true;
    } else {
        console.log("loadProafile error: the current profile is ill-formed")
        return false;
    }
}


function displayTournament(graph_name, profile) {
    var cy_tournament = cytoscape({
    container: document.getElementById(graph_name),
    style: [
        {
        selector: 'node[name]',
        style: {
            'background-color': '#66ccff',
            'content': 'data(name)',
            'width': 50,
            'height': 50,
            'text-valign': 'center',
        }
        },
        {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#ff6600',
            'target-arrow-color': '#ff6600',
            'target-arrow-shape': 'vee',
            'arrow-scale': 2,
            'curve-style': 'bezier',
            'label': (n_voters==1)? '':'data(weight)',
            'text-background-color': '#ffffff',
            'text-background-opacity': 1,
            'text-background-shape': 'rectangle',
            'visibility': (n_voters>=1)? 'visible':'hidden'
        }
        }
    ]
});
    for (let i=0; i<n_candidates; i++) {
        cy_tournament.add({
            group: 'nodes',
            data: { id: i, name: candidateName(i)}
        })
    }
    for (let i=0; i<n_candidates; i++) {
        for (let j=0; j<n_candidates; j++) {
            if (i!=j && profile[i][j]!=0) {
                cy_tournament.add({
                    group: 'edges',
                    data: { source: i, target: j, weight:profile[i][j] }
                })
            }
        }
    }
    var layout = cy_tournament.layout({
        name: 'circle',
        startAngle: ((n_candidates % 2 == 1) ? - Math.PI/2 : -(1/2 + 1/n_candidates) * Math.PI),
        spacingFactor: 1
    });
    layout.run();
}

function displayTree(graph_name, profile, root) {
    var cy_tournament = cytoscape({
    container: document.getElementById(graph_name),
    style: [
        {
        selector: 'node[name]',
        style: {
            'background-color': '#66ccff',
            'content': 'data(name)',
            'width': 50,
            'height': 50,
            'text-valign': 'center',
        }
        },
        {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#ff6600',
            'target-arrow-color': '#ff6600',
            'target-arrow-shape': 'vee',
            'arrow-scale': 2,
            'curve-style': 'bezier',
            'label': (n_voters==1)? '':'data(weight)',
            'text-background-color': '#ffffff',
            'text-background-opacity': 1,
            'text-background-shape': 'rectangle',
            'visibility': (n_voters>=1)? 'visible':'hidden'
        }
        }
    ]
});
    for (let i=0; i<n_candidates; i++) {
        cy_tournament.add({
            group: 'nodes',
            data: { id: i, name: candidateName(i)}
        })
    }
    for (let i=0; i<n_candidates; i++) {
        for (let j=0; j<n_candidates; j++) {
            if (i!=j && profile[i][j]!=0) {
                cy_tournament.add({
                    group: 'edges',
                    data: { source: i, target: j, weight:profile[i][j] }
                })
            }
        }
    }
    var layout = cy_tournament.layout({
        name: 'breadthfirst',
        directed: true
    });
    layout.run();
}

function displayNeighborhood(graph_name, struct, winner) {
    var cy_tournament = cytoscape({
    container: document.getElementById(graph_name),
    style: [
        {
        selector: 'node[name]',
        style: {
            'background-color': '#66ccff',
            'content': 'data(name)',
            'width': 50,
            'height': 50,
            'text-valign': 'center',
        }
        },
        {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#ff6600',
            'target-arrow-color': '#ff6600',
            'target-arrow-shape': 'vee',
            'arrow-scale': 2,
            'curve-style': 'bezier',
            'label': (n_voters==1)? '':'data(weight)',
            'text-background-color': '#eeeeee',
            'text-background-opacity': 1,
            'text-background-shape': 'rectangle'
        }
        }
    ]
    });
    for (let i=0; i<n_candidates; i++) {
        cy_tournament.add({
            group: 'nodes',
            data: { id: `parent${i}`, root: i, direction: (i==winner) ? 'leftward': 'rightward'}
        })
        cy_tournament.add({
            group: 'nodes',
            data: { id: i, name: candidateName(i), parent: `parent${i}`}})
        for (let j=0; j<struct[i].length; j++) {
            cy_tournament.add({
                group: 'nodes',
                data: { id: `${i}${struct[i][j][0]}`, name: candidateName(struct[i][j][0]), parent: `parent${i}`}
            })
            if (i==winner) {
                cy_tournament.add({
                    group: 'edges',
                    data: {source: `${i}${struct[i][j][0]}`, target: i, weight:struct[i][j][1], toDel: true}
                })
            } else {
                cy_tournament.add({
                    group: 'edges',
                    data: {source: `${i}${struct[i][j][0]}`, target: i, weight:struct[i][j][1]}
                })
            }
            
        }
    }

    var parentNodes = cy_tournament.nodes(':parent');
    console.log(parentNodes)

    parentNodes.forEach(parent => {
        const layout = parent.descendants().layout({
            name: 'breadthfirst',
            directed: true,
            spacingFactor: 1,
            roots: parent.data('root')
        });
        layout.run();
    });

    cy_tournament.edges('[toDel]').remove();
    for (let j=0; j<struct[winner].length; j++) {
        if (struct[winner][j][1] > 0) {
            cy_tournament.add({
                group: 'edges',
                data: {source: winner, target: `${winner}${struct[winner][j][0]}`, weight:struct[winner][j][1]}
            })
        }
    }

    var mock_tournament = cytoscape({
    container: document.getElementById("struct_graph2"),
    style: [
        {
        selector: 'node[w]',
        style: {
            'background-color': '#66ccff',
            'width': 50,
            'height': 50,
            'text-valign': 'center',
            'width': 'data(w)',
            'height': 'data(h)',
            'shape': 'rectangle'

        }
        },
        {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#ff6600',
            'target-arrow-color': '#ff6600',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': (n_voters==1)? '':'data(weight)',
            'text-background-color': '#ffffff',
            'text-background-opacity': 1,
            'text-background-shape': 'rectangle'
        }
        }
    ]
    });

    parentNodes.forEach(parent => {
        const dims = parent.first().layoutDimensions();
        mock_tournament.add({
            group: 'nodes',
            data: {w: dims.w, h:dims.h, id:parent.id(), root:parent.data('root')},
        });
    });

    const cols = Math.ceil(n_candidates/Math.ceil(Math.sqrt(n_candidates)));
    const layout = mock_tournament.layout({
            name: 'grid',
            cols: cols,
            position: function(node) {
                let i = node.data('root');
                if (i==winner) {
                    return {row:0, col:0}
                } else {
                    if (i<winner) {
                        i = i+1;
                    }
                    return {row:~~(i / cols),col: i%cols}
                }
            }
        });
    layout.run();

    parentNodes.forEach(parent => {
        const pos = mock_tournament.getElementById(parent.data('id')).position();
        parent.position(pos);
    });

    mock_tournament.destroy();

    cy_tournament.fit();
}

function createTournament(){
    displayTournament('tournament_graph', profile)
}


document.getElementById("loadBtn")
  .addEventListener("click", function(){loadProfile()
     createTournament()});

var winners;

function intArrayEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function createWinnerChoice(new_winners){
    if (winners==undefined || !intArrayEqual(new_winners, winners)) {
        winners = new_winners;
        var old_winners_form = document.getElementById("winnersForm");
        var element = document.getElementById("winners");
        const form = document.createElement('form');
        form.setAttribute("id", "winnersForm")
        const fieldset = document.createElement("fieldset");
        const legend = document.createElement('legend');
        legend.textContent ="Select a winner for which to generate an explanation:";
        fieldset.appendChild(legend);

        for (let i=0; i<winners.length; i++) {
            const w = winners[i];
            const container = document.createElement('div');

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'winner';
            input.value = w;
            input.id = "candidate" + w.toString();
            if (i==0) {
                input.checked = true;
            }

            const label = document.createElement('label');
            label.htmlFor = w;
            label.textContent = "Candidate " + candidateName(w);

            container.appendChild(input);
            container.appendChild(label);
            fieldset.appendChild(container);
        }
        form.appendChild(fieldset);
        if (old_winners_form) {
            element.replaceChild(form, old_winners_form);
        } else {
            element.appendChild(form);
        }
    }
}

createWinnerChoice([]);

var election;

function computeWinners(){
    if (!loadProfile()) {
        console.log("computeWinner error: no profile loaded");
    } else {
        const selected = document.querySelector('input[name="rule"]:checked').value;

        if (!selected) {
            console.log("computeWinners error: no rule selected");
        } else {
            //console.log(selected);
            if (selected=="tc") {
                election = new Topcycle(profile);
            } else if (selected=="uc") {
                election = new Uncoveredset(profile);
            } else if (selected=="co") {
                election = new Copeland(profile);
            } else if (selected=="bo") {
                election = new Borda(profile);
            } else if (selected=="mm") {
                election = new Maximin(profile);
            } else if (selected=="wuc") {
                election = new Weighteduncoveredset(profile);
            } else {
                console.log("computeWinner error: unkown rule");
            }

            var temp_winners = election.winners();
            createWinnerChoice(temp_winners)
        }
    }   
}


document.getElementById("computeWinnersBtn")
    .addEventListener("click", computeWinners);


async function computeExplanation() {
    const selected = document.querySelector('input[name="winner"]:checked');

    if (!selected) {
        console.log("computeExplanation error: no winner selected");
        
    } else {
        var old_exp_txt = document.getElementById("exp_text");
        const value = selected.value;
        election.focus(parseInt(value));

        var element = document.getElementById("explanation");

        const exp_txt = document.createElement('textarea');
        exp_txt.id = "exp_text"
        exp_txt.readOnly = true;
        exp_txt.rows = 20;
        exp_txt.cols = 50;
        let explanation = await election.explanation();
        exp_txt.textContent = explanation.join("\n");

        if (old_exp_txt) {
            element.replaceChild(exp_txt, old_exp_txt);
        } else {
            element.appendChild(exp_txt);
        }
    }
}


async function createMS(){
    let ms = await election.minimal_support();
    let structure = await election.structure();
    displayTournament('ms_graph', ms);
    const winner = document.querySelector('input[name="winner"]:checked').value;
    const rule = document.querySelector('input[name="rule"]:checked').value;
    if (rule == 'tc' || rule == 'uc' || rule == 'wuc') {
        displayTree('struct_graph', ms, winner);
    } else if (rule == 'co' || rule == 'bo' || rule == 'mm') {
        displayNeighborhood('struct_graph', structure, winner);
    } else {
        console.log("createMS error: unkown rule");
    }
}

document.getElementById("explainBtn")
    .addEventListener("click", async function(){computeExplanation()
     await createMS()});
