import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CoinProps } from '../home'
import styles from './detail.module.css'

interface ResponseData {
  data: CoinProps;
}

interface ErrorData {
  error: string;
}

type DataProps = ResponseData | ErrorData

const coinCapAPIKey = import.meta.env.VITE_COINCAP_API_KEY;

export function Detail() {
  const { crypto } = useParams()
  const navigate = useNavigate()

  const [coin, setCoin] = useState<CoinProps>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getCoin() {
      try {
        fetch(`https://rest.coincap.io/v3/assets/${crypto}?apiKey=${coinCapAPIKey}`)
          .then(response => response.json())
          .then((data: DataProps) => {
            if ("error" in data) {
              navigate("/")
              return
            }

            const price = Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD"
            })

            const priceCompact = Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact"
            })

            const resultData = {
              ...data.data,
              formattedPrice: price.format(Number(data.data.priceUsd)),
              formattedMarket: priceCompact.format(Number(data.data.marketCapUsd)),
              formattedVolume: priceCompact.format(Number(data.data.volumeUsd24Hr))
            }

            setCoin(resultData)
            setLoading(false)

          })
      } catch (err) {
        console.log(err)
        navigate("/")
      }
    }

    getCoin()
  }, [crypto])

  if (loading || !coin) {
    return (
      <div className={styles.container}>
        <h4 className={styles.center}>Loading details, please wait...</h4>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.center}>{coin?.name}</h1>
      <h1 className={styles.center}>{coin?.symbol}</h1>

      <section className={styles.content}>
        <img
          alt="logo da moeda"
          src={`https://assets.coincap.io/assets/icons/${coin?.symbol.toLocaleLowerCase()}@2x.png`}
          className={styles.logo}
        />
        <h1>{coin?.name} | {coin?.symbol}</h1>
        <p><strong>Preco: </strong>{coin?.formattedPrice}</p>

        <a>
          <strong>Mercado: </strong>{coin?.formattedMarket}
        </a>
        <a>
          <strong>Volume: </strong>{coin?.formattedVolume}
        </a>
        <a>
          <strong>Mudanca 24h: </strong><span className={Number(coin?.changePercent24Hr) > 0 ? styles.profit : styles.loss}>{Number(coin?.changePercent24Hr).toFixed(4)}</span>
        </a>
      </section>
    </div>
  )
}
