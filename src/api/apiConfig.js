import axios from 'axios';

const getBaseUrl = type => `https://craft-demo-server.vercel.app/${type}`;

const get = async (type, dependencyList) => {
    let url = getBaseUrl(type);
    if (Object.keys(dependencyList).length > 0) {
        url += '?';
        let list = []
        Object.keys(dependencyList).forEach(key => {
            list.push(`${key}=${dependencyList[key]}`);
        })
        url += list.join('&');
    }
    console.log(url);
    const res = await axios.get(url);
    return res.data;
}

const post = async (type, record) => {
    let url = getBaseUrl(type);
    const res = await axios.post(url, record);
    return res.data
}

const put = async (type, id, newRecord) => {
    let url = getBaseUrl(type);
    url += `/${id}`;

    const res = await axios.put(url, newRecord);
    return res.data;
}

const deleteRecord = async (type, id) => {
    let url = getBaseUrl(type);
    url += `/${id}`;
    const res = await axios.delete(url);
    return res.data;
}
export { get , post, put, deleteRecord};