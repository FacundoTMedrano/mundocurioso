import categorias from "../constants/categorias";
import { base } from "../constants/base";

export default function Home() {
    return (
        <main>
            <div>
                {categorias.map((v) => {
                    const url = `${base}/imgs/categorias/medium/${v.replaceAll(
                        " ",
                        "-"
                    )}.webp`;
                    return (
                        <img
                            key={`${v}img`}
                            src={url}
                            style={{ width: "200px" }}
                        />
                    );
                })}
            </div>
        </main>
    );
}
