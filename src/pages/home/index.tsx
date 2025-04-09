import { useState, FormEvent, useEffect } from 'react'
import styles from './home.module.css'
import { BsSearch } from 'react-icons/bs'
import { Link, useNavigate } from 'react-router-dom'

const coinCapAPIKey = import.meta.env.VITE_COINCAP_API_KEY;

export interface CoinProps {
  id: string;
  name: string;
  symbol: string;
  priceUsd: string;
  vwap24Hr: string;
  changePercent24Hr: string;
  rank: string;
  supply: string
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  explorer: string;
  formattedPrice?: string;
  formattedMarket?: string;
  formattedVolume?: string;
}

interface DataProp {
  data: CoinProps[]
}

export function Home() {
  const [input, setInput] = useState("")
  const [coins, setCoins] = useState<CoinProps[]>([])
  const [offset, setOffset] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [offset])

  async function getData() {
    fetch(`https://rest.coincap.io/v3/assets?apiKey=${coinCapAPIKey}&limit=10&offset=${offset}`)
      .then(response => response.json())
      .then((data: DataProp) => {
        const coinsData = data.data

        const price = Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        })

        const priceCompact = Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          notation: "compact"
        })

        const formattedResult = coinsData.map((item) => {
          const formatted = {
            ...item,
            formattedPrice: price.format(Number(item.priceUsd)),
            formattedMarket: priceCompact.format(Number(item.marketCapUsd)),
            formattedVolume: priceCompact.format(Number(item.volumeUsd24Hr))
          }
          return formatted
        })

        const listCoins = [...coins, ...formattedResult]

        setCoins(listCoins)
      })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (input === "") return

    navigate(`/detail/${input}`)
  }

  function handleGetMore() {
    if (offset === 0) {
      setOffset(10)
      return;
    }
    setOffset(current => current + 10)
  }

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Digite o nome da moeda... ex: Bitcoin"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">
          <BsSearch size={30} color="#FFF" />
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th scope="col">Moeda</th>
            <th scope="col">Valor mercado</th>
            <th scope="col">Preco</th>
            <th scope="col">Volume</th>
            <th scope="col">Mudanca 24h</th>
          </tr>
        </thead>
        <tbody id="tbody">
          {coins.length > 0 && coins.map((item) => (
            <tr className={styles.tr} key={item.id}>
              <td className={styles.tdLabel} data-label="Moeda">
                <div className={styles.name}>
                  <img
                    className={styles.logo}
                    alt="logo-crypto"
                    src={`https://assets.coincap.io/assets/icons/${item.symbol.toLocaleLowerCase()}@2x.png`} />
                  <Link to={`/detail/${item.id}`}>
                    <span>{item.name}</span> | {item.symbol}
                  </Link>
                </div>
              </td>
              <td className={styles.tdLabel} data-label="Valor mercado">
                {item.formattedMarket}
              </td>
              <td className={styles.tdLabel} data-label="Preco">
                {item.formattedPrice}
              </td>
              <td className={styles.tdLabel} data-label="Volume">
                {item.formattedVolume}
              </td>
              <td className={Number(item.changePercent24Hr) > 0 ? styles.tdProfit : styles.tdLoss}
                data-label="Mudanca 24h">
                <span>{Number(item.changePercent24Hr).toFixed(4)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className={styles.buttonMore} onClick={handleGetMore}>
        Carregar mais
      </button>

    </main>
  )
}
