import { GET_DEPENDENCIES, IS_LOADING_DEP, SELECT_ID, ADD_TOAST, REMOVE_TOAST } from './actionsTypes';
import { get, post, put, deleteRecord } from "../../api/apiConfig";
import actionsTypes from './actionsTypes';

// data : 
// transactions : ['accounts']
// trends : ['transactions', 'budgets']

// -> tags, accounts, trans, budgets, trends
// topo - BFS
// ['accounts', 'budgets', 'tags', 'transactions', 'trends']

// adj
// accounts: ['transactions'], budgets: ['trends'], tags: [], transactions: ['trends'], trends: []

const getTopoSortBFS = (data) => {
    let topo = [];
    let indegree = new Map();
    let keys = ["accounts", "transactions", "budgets", "trends", "tags"];
    let adj = {};
    for (let key of keys) {
        if (adj[key] === undefined) adj[key] = [];
        for (let child of data[key] || []) {
            adj[child].push(key);
        }
    }
    let que = [];
    for (let key of keys) {
        if (!indegree.has(key)) indegree.set(key, 0)
        for (let child of adj[key] || []) {
            let ind = indegree.get(child) || 0;
            indegree.set(child, ind + 1);
        }
    }
    for (let key of keys) {
        if (indegree.get(key) === 0) {
            que.push(key);
        }
    }

    while (que.length) {
        let key = que.shift();
        topo.push(key);
        for (let ele of adj[key] || []) {
            let ind = indegree.get(ele) - 1;
            indegree.set(ele, ind);
            if (ind === 0) que.push(ele);
        }
    }
    return topo;
}
const getTopoSortDFS = (data) => {
    let topo = [];
    let keys = ["accounts", "transactions", "budgets", "trends", "tags"];
    let adj = {};
    for (let key of keys) {
        if (adj[key] === undefined) adj[key] = [];
        for (let child of data[key] || []) {
            adj[child].push(key);
        }
    }
    let stack = [];
    let visited = {};
    for (let key of keys) {
        if (visited[key] == undefined) {
            findTopoSOrt(key, visited, stack, adj);
        }
    }
    while (stack.length) {
        topo.push(stack.pop());
    }
    return { adj, topo };
}
function findTopoSOrt(node, vis, st, adj) {
    vis[node] = 1;
    for (let ele of adj[node]) {
        if (vis[ele] == undefined) {
            findTopoSOrt(ele, vis, st, adj);
        }
    }
    st.push(node);
}
let keys = {
    accounts: { selected: '', refer: 'accountId' },
    transactions: { selected: '', refer: 'transactionId' },
    budgets: { selected: '', refer: 'budgetId' },
    trends: { selected: '', refer: 'trendsId' },
    tags: { selected: '', refer: "tagId" }
}
let selectedIds = {
    accounts: "", transactions: "", trends: "", tags: "", budgets: ""
};
// const callGetApis = (order, data, selectedIds, dispatch) => {
//     let promise = Promise.resolve();
//     for (let key of order) {
//         promise = promise.then(() => {
//             return new Promise((resolve, reject) => {
//                 let dependants = getDependants(data, key, selectedIds);

//                 dispatch({ type: actionsTypes[key].IS_LOADING, isLoading: true })
//                 get(key, dependants).then(data => {
//                     selectedIds[key] = data[0]?.id || '';
//                     dispatch({ type: actionsTypes[key].READ, records: data });
//                     return data;
//                 }).then(data => {
//                     dispatch({ type: actionsTypes[key].SELECT_ENTITY, selected: data[0] || {} });
//                     dispatch({ type: SELECT_ID, key: key, selectedId: data[0]?.id || '' })
//                     dispatch({ type: actionsTypes[key].IS_LOADING, isLoading: false })
//                     resolve();
//                 }).catch(e => {
//                     dispatch({ type: actionsTypes[key].IS_LOADING, isLoading: false })
//                     reject(e);
//                 })
//             })
//         })
//     }
//     promise.finally(() => {
//         dispatch(({ type: IS_LOADING_DEP, isLoading: false }))
//     })
// }

const callGetApis = async (order, data, selectedIds, dispatch) => {
    for await (let key of order) {
        try {
            let dependants = getDependants(data, key, selectedIds);
            dispatch({ type: actionsTypes[key].IS_LOADING, isLoading: true })
            const newData = await get(key, dependants).then(data => {
                selectedIds[key] = data[0]?.id || '';
                dispatch({ type: actionsTypes[key].READ, records: data });
                return data;
            })
            dispatch({ type: actionsTypes[key].SELECT_ENTITY, selected: newData[0] || {} });
            dispatch({ type: SELECT_ID, key: key, selectedId: newData[0]?.id || '' })
            dispatch({ type: actionsTypes[key].IS_LOADING, isLoading: false })
        } catch (error) {
            console.log(error)
            dispatch({ type: actionsTypes[key].IS_LOADING, isLoading: false })
        }
    }
    dispatch(({ type: IS_LOADING_DEP, isLoading: false }))

}

const getDependencies = () => dispatch => {
    dispatch(({ type: IS_LOADING_DEP, isLoading: true }))
    get('dependencies', {})
        .then(data => {
            let { adj, topo } = getTopoSortDFS(data)
            dispatch({ type: GET_DEPENDENCIES, dependencies: data, adjacency: adj, topo: topo });
            callGetApis(topo, data, selectedIds, dispatch);
        })
        .catch(e => {
            console.log(e)
            dispatch(({ type: IS_LOADING_DEP, isLoading: false }))
        })
}

const changeSelection = (order, data, selectedIds) => {
    return dispatch => {
        callGetApis(order, data, selectedIds, dispatch)
    }
}

const editFormData = (type, id, data) => {
    return (dispatch, getState) => {
        put(type, id, data).then(res => {
            refreshData(dispatch, type, getState);
        }).catch(e => {
            console.log(e)
        })
    }
}

const addNewData = (type, data) => {
    return (dispatch, getState) => {
        post(type, data).then(res => {
            refreshData(dispatch, type, getState);
        }).catch(e => {
            console.log(e)
            dispatch(addToast(type, `Failed adding ${type}`))
        })
    }
}

const getQueryObj = (fields, selectedIds, dependencies) => {
    let obj = {};
    dependencies.forEach(dep => {
        let [key, val] = [fields[dep], selectedIds[dep]];
        obj[key] = val;
    })
    return obj;
}

const deleteData = (type, id) => {
    return (dispatch, getState) => {
        deleteRecord(type, id).then(data => {
            refreshData(dispatch, type, getState);
        })
    }
}

function refreshData(dispatch, type, getState) {
    dispatch({ type: actionsTypes[type].IS_LOADING, isLoading: true });
    let { fields, selectedIds, dependencies } = getState().dependency;
    let obj = getQueryObj(fields, selectedIds, dependencies[type]);
    get(type, obj).then(data => {
        dispatch({ type: actionsTypes[type].SELECT_ENTITY, selected: data[0] || {} });
        dispatch({ type: actionsTypes[type].READ, records: data });
        dispatch({ type: SELECT_ID, key: type, selectedId: data[0]?.id || '' });
        dispatch({ type: actionsTypes[type].IS_LOADING, isLoading: false });
    }).catch(e => {
        dispatch({ type: actionsTypes[type].IS_LOADING, isLoading: false });
    });
}

function getDependants(data, key, selectedIds) {
    let dependants = {};
    // tranverse through all dependencies of the curremt key and add the default id
    for (let dep of data[key] || []) {
        let ele = keys[dep].refer;
        let id = selectedIds[dep];
        dependants[ele] = id;
    }
    return dependants;
}


// Toasts

const createToast = (type, description) => {
    return {
        id: Math.floor((Math.random() * 101) + 1),
        title: type === 'success' ? 'Success' : 'Failed',
        description,
        backgroundColor: type === 'success' ? '#5db74e' : '#d82938b0',
        type
    }
}
const addToast = (type, description) => {
    return {
        type: ADD_TOAST,
        toast: createToast(type, description)
    };
}

const removeToast = (id) => {
    return {
        type: REMOVE_TOAST,
        id: id
    };
}

export {
    getDependencies,
    changeSelection,
    editFormData,
    deleteData,
    addNewData,
    addToast,
    removeToast
};


