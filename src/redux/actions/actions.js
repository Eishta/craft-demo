import { GET_DEPENDENCIES, IS_LOADING_DEP, SELECT_ID } from "./actionsTypes";
import { get, post, put, deleteRecord } from "../../api/apiConfig";
import actionsTypes from "./actionsTypes";
import { getTopoSortDFS } from "./getTopoSortDFS";

let keys = {
  accounts: { refer: "accountId" },
  transactions: { refer: "transactionId" },
  budgets: { refer: "budgetId" },
  trends: { refer: "trendsId" },
  tags: { refer: "tagId" },
};
let selectedIds = {
  accounts: "",
  transactions: "",
  trends: "",
  tags: "",
  budgets: "",
};

// CREATE
// action to create a new data entity record
const addNewData = (type, data) => async (dispatch, getState) => {
  try {
    await post(type, data);
    refreshData(dispatch, type, getState);
  } catch (e) {
    console.log(e);
    dispatch({ type: "ERROR", error: e.message });
  }
};

// READ
const callGetApis = async (order, data, selectedIds, dispatch) => {
  for await (let key of order) {
    try {
      let dependants = getDependants(data, key, selectedIds);
      dispatch({ type: actionsTypes[key].IS_LOADING, isLoading: true });
      const newData = await get(key, dependants).then((data) => {
        selectedIds[key] = data[0]?.id || "";
        dispatch({ type: actionsTypes[key].READ, records: data });
        return data;
      });
      dispatch({
        type: actionsTypes[key].SELECT_ENTITY,
        selected: newData[0] || {},
      });
      dispatch({ type: SELECT_ID, key: key, selectedId: newData[0]?.id || "" });
      dispatch({ type: actionsTypes[key].IS_LOADING, isLoading: false });
    } catch (error) {
      console.log(error);
      dispatch({ type: actionsTypes[key].IS_LOADING, isLoading: false });
    }
  }
  dispatch({ type: IS_LOADING_DEP, isLoading: false });
};

const getDependencies = () => async (dispatch) => {
  dispatch({ type: IS_LOADING_DEP, isLoading: true });
  try {
    let dependencies = await get("dependencies", {});
    let result = getTopoSortDFS(dependencies);
    console.log(result);
    if (typeof result === "string") throw new Error(result);
    let { adj, topo } = result;
    dispatch({
      type: GET_DEPENDENCIES,
      dependencies: dependencies,
      adjacency: adj,
      topo: topo,
    });
    callGetApis(topo, dependencies, selectedIds, dispatch);
  } catch (error) {
    console.log(error);
    dispatch({ type: IS_LOADING_DEP, isLoading: false });
    dispatch({ type: "ERROR", error: error.message });
  }
};
// UPDATE
// action to update a record with 'id'
const editFormData = (type, id, data) => async (dispatch, getState) => {
  try {
    await put(type, id, data);
    refreshData(dispatch, type, getState);
  } catch (error) {
    console.log(error);
    dispatch({ type: "ERROR", error: error.message });
  }
};
const changeSelection = (order, data, selectedIds) => {
  return (dispatch) => {
    callGetApis(order, data, selectedIds, dispatch);
  };
};



// function to map the dependency and the value for a get request for entity
const getQueryObj = (fields, selectedIds, dependencies) => {
  let obj = {};
  dependencies.forEach((dep) => {
    let [key, val] = [fields[dep], selectedIds[dep]];
    obj[key] = val;
  });
  return obj;
};

// DELETE
// action creator for delete entity
const deleteData = (type, id) => {
  return (dispatch, getState) => {
    deleteRecord(type, id).then((data) => {
      refreshData(dispatch, type, getState);
    });
  };
};

// refresh the data of the entity when some record is added or updated
const refreshData = (dispatch, type, getState) => {
  dispatch({ type: actionsTypes[type].IS_LOADING, isLoading: true });
  let { fields, selectedIds, dependencies } = getState().dependency;
  let obj = getQueryObj(fields, selectedIds, dependencies[type]);
  get(type, obj)
    .then((data) => {
      dispatch({
        type: actionsTypes[type].SELECT_ENTITY,
        selected: data[0] || {},
      });
      dispatch({ type: actionsTypes[type].READ, records: data });
      dispatch({ type: SELECT_ID, key: type, selectedId: data[0]?.id || "" });
      dispatch({ type: actionsTypes[type].IS_LOADING, isLoading: false });
    })
    .catch((e) => {
      dispatch({ type: actionsTypes[type].IS_LOADING, isLoading: false });
    });
};

function getDependants(data, key, selectedIds) {
  let dependants = {};
  // traverse through all dependencies of the curremt key and add the default id
  for (let dep of data[key] || []) {
    let ele = keys[dep].refer;
    let id = selectedIds[dep];
    dependants[ele] = id;
  }
  return dependants;
}

export {
  getDependencies,
  changeSelection,
  editFormData,
  deleteData,
  addNewData,
};
