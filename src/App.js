function App() {
  const [firstNumber, setFirstNumber] = React.useState('');
  const [secondNumber, setSecondNumber] = React.useState('');
  const [randomValue, setRandomValue] = React.useState(null);

  const handleGenerateRandom = () => {
    const num1 = parseInt(firstNumber, 10);
    const num2 = parseInt(secondNumber, 10);

    if (num1 <= num2 || num1 === num2 || isNaN(num1) || isNaN(num2)) {
      alert("Введите правильные числа и первое число должно быть больше второго, а также оба числа не должны быть равны");
      return;
    }

    const random = Math.floor(Math.random() * (num1 - num2 + 1)) + num2;
    setRandomValue(random);
  };

  return (
    <div>
      <h1>Рандомайзер</h1>
      <input
        type="number"
        placeholder="Введите первое число"
        value={firstNumber}
        onChange={(e) => setFirstNumber(e.target.value)}
      />
      <input
        type="number"
        placeholder="Введите второе число"
        value={secondNumber}
        onChange={(e) => setSecondNumber(e.target.value)}
      />
      <button onClick={handleGenerateRandom}>Нажми</button>
      
      {/* Добавь data-testid сюда */}
      {randomValue !== null && (
        <div data-testid="rnd_number" className="rnd_number">
          {randomValue}
        </div>
      )}
    </div>
  );
}

export default App;
