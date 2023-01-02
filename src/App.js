import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AddEntity from './pages/AddEntity';
import EditEntity from './pages/EditEntity';
import { useEffect } from 'react';
import { getDependencies } from './redux/actions/actions';
import { useDispatch } from 'react-redux';
import './App.css';

const App = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getDependencies());
    }, [])
    return (
        <Router>
            <Routes>
                <Route exact path='/craft-demo' element={< Home />}></Route>
                <Route exact path='/' element={< Home />}></Route>
                <Route exact path='/edit/:type/:id' element={< EditEntity />}></Route>
                <Route exact path='/add/:type' element={< AddEntity />}></Route>
            </Routes>
        </Router>
    )
}

export default App