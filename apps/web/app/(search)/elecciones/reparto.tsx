import type { ReactNode } from 'react';
import { cocientes } from '../../../lib/congreso';
import { averagePerSeat, provincias, SEATS, type Provincia } from '../../../lib/elecciones';
import { RepartoDhondt } from './animaciones';
import { Bloque } from './bloque';
import { Laboratorio } from './laboratorio';

const numero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const porcentaje = new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 });
// Partes pequeñas del Congreso o de la población, como 0,57 %: dos cifras significativas.
const cuota = new Intl.NumberFormat('es-ES', { style: 'percent', maximumSignificantDigits: 2 });
const loreg162 = 'https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#a162';
const loreg163 = 'https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#a163';
// El laboratorio compara la provincia elegida con la que menos escaños elige y la que más.
const SORIA = '42';
const MADRID = '28';
const validos = (p: Provincia) => p.results2023.voters - p.results2023.invalid;
const circunscripcion = (p: Provincia) => ({ name: p.name, seats: p.seats, validos: validos(p) });
const comparar = (ids: string[]) =>
  provincias
    .filter((q) => ids.includes(q.id))
    .sort((a, b) => a.seats - b.seats)
    .map(circunscripcion);
// Sin provincia elegida, el laboratorio usa una inventada de tamaño medio.
const INVENTADA = { name: 'esta provincia', seats: 5, validos: 300000 };
const laboratorio = 'Laboratorio con partidos inventados';
const mueve =
  'Mueve los porcentajes, que siempre suman el 100 %, o pulsa uno de los experimentos de abajo.';

// Sin provincia elegida: los mismos bloques con la suma de toda España; el D'Hondt, que se hace
// provincia a provincia, lo explica el laboratorio.
export function RepartoGeneral() {
  const ceutaMelilla = provincias.filter((p) => p.seats === 1);
  const ley = 2 * (provincias.length - ceutaMelilla.length) + ceutaMelilla.length;
  // La barrera se mira en cada provincia antes de sumar.
  const espana = provincias.map(destinos).reduce((a, b) => ({
    escano: a.escano + b.escano,
    sin: a.sin + b.sin,
    bajo: a.bajo + b.bajo,
    blanco: a.blanco + b.blanco,
    nulo: a.nulo + b.nulo,
    voters: a.voters + b.voters,
    census: a.census + b.census,
  }));
  const sinBarrera = ceutaMelilla.reduce((sum, p) => sum + destinos(p).sin, 0);
  return (
    <section id="reparto" className="el-reparto" aria-labelledby="el-reparto-titulo">
      <h2 id="el-reparto-titulo">Cómo se eligen los diputados</h2>
      <Bloque
        n="01"
        titulo={`De dónde salen los ${SEATS} escaños`}
        texto={
          <>
            <p>
              Cada provincia elige a sus diputados por separado, con sus propios votos. La ley da 2
              escaños a cada provincia y uno a Ceuta y otro a Melilla; el resto se reparte según la
              población (
              <a className="enlace" href={loreg162}>
                art. 162 de la LOREG
              </a>
              ).
            </p>
            <p>Elige tu provincia en el mapa o en el desplegable para verlo con sus datos.</p>
          </>
        }
      >
        <Escanos ley={ley} seats={SEATS} seats2023={SEATS} pequenos />
        <p className="el-paso">
          {`2 por cada una de las ${provincias.length - ceutaMelilla.length} provincias, más Ceuta y Melilla: ${ley} por ley. Los ${SEATS - ley} restantes, según la población.`}
        </p>
      </Bloque>
      <Laboratorio
        n="02"
        titulo={laboratorio}
        texto={
          <>
            <p>
              En cada provincia, las candidaturas que no llegan al 3 % de los votos válidos, que
              incluyen el voto en blanco, se quedan fuera. Los votos de las demás se dividen entre
              1, 2, 3… y los escaños van, uno a uno, a los cocientes más altos: es el método D'Hondt
              (
              <a className="enlace" href={loreg163}>
                art. 163 de la LOREG
              </a>
              ). Ceuta y Melilla dan su escaño a la candidatura más votada.
            </p>
            <p>
              Pruébalo con cuatro partidos ficticios, A, B, C y D, en una provincia inventada de{' '}
              {INVENTADA.seats} escaños y {numero.format(INVENTADA.validos)} votos válidos. {mueve}
            </p>
          </>
        }
        provincia={INVENTADA}
        comparar={comparar([SORIA, MADRID])}
      />
      <Bloque
        n="03"
        titulo="Votos que no eligieron a nadie"
        texto={
          <p>
            Los votos a candidaturas que se quedan sin escaño no eligen a ningún diputado. Tampoco
            los votos en blanco, que sí cuentan para calcular la barrera del 3 %, ni los nulos.
            Aquí, la suma de las {provincias.length} circunscripciones.
          </p>
        }
      >
        <VotosSinEscano nombre="España" d={espana} barrera>
          <p className="el-paso">
            {`Ceuta y Melilla no tienen barrera: sus ${numero.format(sinBarrera)} votos a candidaturas sin escaño se cuentan en la segunda fila.`}
          </p>
        </VotosSinEscano>
      </Bloque>
      <Bloque
        n="04"
        titulo={`Los ${SEATS} escaños del Congreso`}
        texto={
          <p>
            Los diputados de las {provincias.length} circunscripciones forman el Congreso. Cada
            punto es un escaño.
          </p>
        }
      >
        <Hemiciclo texto={`La línea marca la mitad: la mayoría absoluta son ${SEATS / 2 + 1}.`} />
      </Bloque>
    </section>
  );
}

// Cómo se eligen los diputados de la provincia elegida: sus escaños, el reparto de 2023, los votos
// que no eligieron a nadie y su peso en el Congreso.
export function Reparto({ p }: { p: Provincia }) {
  const r = p.results2023;
  return (
    <section id="reparto" className="el-reparto" aria-labelledby="el-reparto-titulo">
      <h2 id="el-reparto-titulo">Cómo se eligen los diputados de {p.name}</h2>
      <Bloque
        n="01"
        titulo="De dónde salen sus escaños"
        texto={
          <p>
            {p.seats === 1
              ? 'La ley da un escaño a Ceuta y otro a Melilla.'
              : 'Primero, los 2 escaños que la ley da a cada provincia; después, los que le tocan por su población.'}
          </p>
        }
      >
        <EscanosProvincia p={p} />
      </Bloque>
      <Bloque
        n="02"
        titulo="El reparto de 2023, escaño a escaño"
        texto={
          <>
            <p>
              Los votos de cada candidatura se dividen entre 1, 2, 3… y los escaños van, uno a uno,
              a los cocientes más altos: es el método D'Hondt (
              <a className="enlace" href={loreg163}>
                art. 163 de la LOREG
              </a>
              ).
            </p>
            <p>
              {r.seats === 1
                ? `Así se eligió el escaño de ${p.name} en las generales de julio de 2023.`
                : `Así se repartieron los ${r.seats} escaños de ${p.name} en las generales de julio de 2023${r.seats === p.seats ? '' : `; en 2026 elige ${p.seats}`}.`}
            </p>
          </>
        }
      >
        <RepartoDhondt
          key={p.id}
          escanos={r.seats}
          blanco={r.blank}
          candidaturas={r.candidatures}
        />
      </Bloque>
      <Bloque
        n="03"
        titulo="Votos que no eligieron a nadie"
        texto={
          <p>
            Los votos a candidaturas que se quedan sin escaño no eligen a ningún diputado. Tampoco
            los votos en blanco{r.seats > 1 && ', que sí cuentan para calcular la barrera del 3 %'},
            ni los nulos.
          </p>
        }
      >
        <VotosSinEscano nombre={p.name} d={destinos(p)} barrera={r.seats > 1} />
      </Bloque>
      <Bloque
        n="04"
        titulo="Sus escaños entre los 350"
        texto={
          <p>
            Los diputados de las 52 circunscripciones forman el Congreso. Cada punto es un escaño;
            {p.seats === 1 ? ' el' : ' los'} de {p.name}, en amarillo.
          </p>
        }
      >
        <Hemiciclo
          tuyos={p.seats}
          texto={`${p.name} elige ${p.seats} ${p.seats === 1 ? 'escaño' : 'escaños'}, el ${cuota.format(p.seats / SEATS)} del Congreso, y tiene el ${cuota.format(p.population / (averagePerSeat * SEATS))} de la población de España. La línea marca la mitad: la mayoría absoluta son 176.`}
        />
      </Bloque>
      <Laboratorio
        key={p.id}
        n="05"
        titulo={laboratorio}
        texto={
          <p>
            Cuatro partidos ficticios, A, B, C y D, con{' '}
            {p.seats === 1 ? 'el escaño' : `los ${p.seats} escaños`} de {p.name} y la participación
            de 2023: {numero.format(validos(p))} votos válidos. {mueve}
          </p>
        }
        provincia={circunscripcion(p)}
        comparar={comparar([SORIA, p.id, MADRID])}
      />
    </section>
  );
}

// 01: los escaños que la ley da a cada provincia y los que le tocan por su población, sin animación.
function EscanosProvincia({ p }: { p: Provincia }) {
  const cambio = p.seats - p.seats2023;
  return (
    <>
      <Escanos ley={2} seats={p.seats} seats2023={p.seats2023} />
      {p.seats > 1 && (
        <p className="el-paso">
          {p.seats === 2
            ? 'Por población no le corresponde ninguno más: elige 2.'
            : `Por población le corresponden ${p.seats - 2} más: elige ${p.seats}.`}
          {cambio !== 0 &&
            ` En 2023 elegía ${p.seats2023}; ahora elige ${Math.abs(cambio)} ${cambio > 0 ? 'más' : 'menos'}.`}
        </p>
      )}
    </>
  );
}

// Los escaños por ley y por población; si había más en 2023, el que se pierde se dibuja vacío.
function Escanos({
  ley,
  seats,
  seats2023,
  pequenos,
}: {
  ley: number;
  seats: number;
  seats2023: number;
  pequenos?: boolean;
}) {
  const cambio = seats - seats2023;
  return (
    <div aria-hidden="true">
      <div className="el-escanos" data-pequenos={pequenos ? '' : undefined}>
        {Array.from({ length: Math.max(seats, seats2023) }, (_, i) => (
          <span
            key={i}
            className="el-escano"
            data-tipo={
              i < ley ? 'ley' : i >= seats ? 'perdido' : i >= seats2023 ? 'nuevo' : 'poblacion'
            }
          />
        ))}
      </div>
      <ul className="el-leyenda">
        <li>
          <span className="el-escano" data-tipo="ley" /> Por ley
        </li>
        {seats > ley && (
          <li>
            <span className="el-escano" data-tipo="poblacion" /> Por población
          </li>
        )}
        {cambio > 0 && (
          <li>
            <span className="el-escano" data-tipo="nuevo" /> Nuevo frente a 2023
          </li>
        )}
        {cambio < 0 && (
          <li>
            <span className="el-escano" data-tipo="perdido" /> Lo elegía en 2023
          </li>
        )}
      </ul>
    </div>
  );
}

// Votos emitidos en 2023 según su destino, sin siglas. La barrera del 3 % se mira con cocientes(),
// que en Ceuta y Melilla deja entrar a todas las candidaturas.
function destinos(p: Provincia) {
  const r = p.results2023;
  const dentro = new Set(
    cocientes(
      r.candidatures.map((c) => c.votes),
      r.blank,
      r.seats,
    ).map((q) => q.i),
  );
  const votos = (f: (seats: number, i: number) => boolean) =>
    r.candidatures.reduce((sum, c, i) => (f(c.seats, i) ? sum + c.votes : sum), 0);
  return {
    escano: votos((seats) => seats > 0),
    sin: votos((seats, i) => seats === 0 && dentro.has(i)),
    bajo: votos((_, i) => !dentro.has(i)),
    blanco: r.blank,
    nulo: r.invalid,
    voters: r.voters,
    census: r.census,
  };
}

// 03: los votos emitidos de una provincia o de toda España, según su destino.
function VotosSinEscano({
  nombre,
  d,
  barrera,
  children,
}: {
  nombre: string;
  d: ReturnType<typeof destinos>;
  barrera: boolean;
  children?: ReactNode;
}) {
  const sinEscano = d.sin + d.bajo;
  const noVotaron = d.census - d.voters;
  const filas = [
    { tono: 'escano', texto: 'A candidaturas con escaño', votos: d.escano },
    ...(barrera
      ? [
          { tono: 'sin', texto: 'A candidaturas sin escaño que superaron el 3 %', votos: d.sin },
          { tono: 'bajo', texto: 'A candidaturas por debajo del 3 %', votos: d.bajo },
        ]
      : [{ tono: 'sin', texto: 'A candidaturas sin escaño', votos: sinEscano }]),
    { tono: 'blanco', texto: 'En blanco', votos: d.blanco },
    { tono: 'nulo', texto: 'Nulos', votos: d.nulo },
  ];
  return (
    <>
      <p className="el-votos-cifra">
        En 2023, <strong className="t-dato">{numero.format(sinEscano)}</strong> votos, el{' '}
        {porcentaje.format(sinEscano / d.voters)} de los emitidos, fueron a candidaturas que no
        obtuvieron escaño.
      </p>
      <div className="el-votos" aria-hidden="true">
        {filas.map((f) => (
          <span key={f.tono} data-tono={f.tono} style={{ flexGrow: f.votos }} />
        ))}
      </div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            Votos emitidos en {nombre} en 2023, según su destino
          </caption>
          <thead>
            <tr>
              <th scope="col">Destino del voto</th>
              <th scope="col">Votos</th>
              <th scope="col">% de los emitidos</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.tono}>
                <th scope="row">
                  <span className="el-muestra" data-tono={f.tono} aria-hidden="true" />
                  {f.texto}
                </th>
                <td>{numero.format(f.votos)}</td>
                <td>{porcentaje.format(f.votos / d.voters)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Votos emitidos</th>
              <td>{numero.format(d.voters)}</td>
              <td>{porcentaje.format(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {children}
      <p className="el-paso">
        {`Además, ${numero.format(noVotaron)} personas con derecho a voto no votaron: el ${porcentaje.format(noVotaron / d.census)} del censo, que incluye a quienes viven en el extranjero.`}
      </p>
    </>
  );
}

// Hemiciclo de 350 escaños en 10 filas, cada una con escaños en proporción a su radio para que
// queden igual de separados. Van de izquierda a derecha: los de una provincia forman una cuña.
const radios = Array.from({ length: 10 }, (_, f) => 40 + (60 * f) / 9);
const sumaRadios = radios.reduce((a, b) => a + b, 0);
const asientos = radios
  .flatMap((r) => {
    const n = Math.round((SEATS * r) / sumaRadios);
    return Array.from({ length: n }, (_, k) => {
      const a = Math.PI * (1 - k / (n - 1));
      return { a, x: +(r * Math.cos(a)).toFixed(1), y: +(-r * Math.sin(a)).toFixed(1) };
    });
  })
  .sort((p, q) => q.a - p.a);

// 04: los 350 escaños del Congreso, con los de la provincia encendidos si la hay, sin animación.
function Hemiciclo({ tuyos = 0, texto }: { tuyos?: number; texto: string }) {
  return (
    <>
      <svg className="el-svg el-hemiciclo" viewBox="-104 -104 208 108" aria-hidden="true">
        {asientos.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="2.6" data-tuyo={i < tuyos ? '' : undefined} />
        ))}
        <line x1="0" y1="-104" x2="0" y2="0" />
      </svg>
      <p className="el-paso">{texto}</p>
    </>
  );
}
