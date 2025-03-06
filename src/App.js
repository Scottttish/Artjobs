import { useState } from "react";

function App() {
  const [firstNumber, setFirstNumber] = useState("");
  const [secondNumber, setSecondNumber] = useState("");
  const [randomNumber, setRandomNumber] = useState(null);

  const generateNumber = () => {
    const numberOne = parseInt(firstNumber);
    const numberTwo = parseInt(secondNumber);

    if (isNaN(numberOne) || isNaN(numberTwo) || numberOne > numberTwo || numberOne === numberTwo) {
      alert("Введите правильные числа и первое число должно быть больше второго, а также оба числа не должны быть равны");
      return;
    }

    const random = Math.floor(Math.random() * (numberTwo - numberOne + 1)) + numberOne;

    setRandomNumber(random);
  };

  return (
    <div>
      <h1>Рандомайзер</h1>
      <input type="text" placeholder="Введите первое число" value={firstNumber} onChange={(e) => setFirstNumber(e.target.value)}/>
      <input type="text" placeholder="Введите второе число" value={secondNumber}onChange={(e) => setSecondNumber(e.target.value)}/>

      <button onClick={generateNumber}>Нажми</button>
      <label className="rnd_number">{randomNumber}</label>
    </div>
  );
}

export default App;
