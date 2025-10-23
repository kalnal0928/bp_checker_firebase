import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import './App.css';

function App() {
  const [bloodPressure, setBloodPressure] = useState([]);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'blood_pressure'));
      setBloodPressure(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchData();
  }, []);

  const addBloodPressure = async () => {
    if (systolic && diastolic) {
      const docRef = await addDoc(collection(db, 'blood_pressure'), {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        timestamp: new Date(),
      });
      setBloodPressure([...bloodPressure, { id: docRef.id, systolic: Number(systolic), diastolic: Number(diastolic), timestamp: new Date() }]);
      setSystolic('');
      setDiastolic('');
    }
  };

  return (
    <div className="App">
      <h1>혈압 기록 앱</h1>
      <div>
        <input
          type="number"
          placeholder="수축기 혈압"
          value={systolic}
          onChange={(e) => setSystolic(e.target.value)}
        />
        <input
          type="number"
          placeholder="이완기 혈압"
          value={diastolic}
          onChange={(e) => setDiastolic(e.target.value)}
        />
        <button onClick={addBloodPressure}>저장</button>
      </div>
      <div>
        <h2>혈압 기록</h2>
        {bloodPressure.length > 0 ? (
          <ul>
            {bloodPressure.map((bp) => (
              <li key={bp.id}>
                {`${bp.systolic}/${bp.diastolic} mmHg - ${bp.timestamp.toDate().toLocaleString()}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>기록이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default App;
