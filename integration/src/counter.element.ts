import { observable, observe, OnChange, PropChanges, styled } from '@joist/component';
import { inject } from '@joist/di';
import { injectable } from '@joist/di-dom';

import { MathService } from './math.service';

const template = document.createElement('template');
template.innerHTML = /*html*/ `
  <button id="dec">-</button>
  <span id="count"></span>
  <button id="inc">+</button>
`;

@injectable()
@observable()
@styled([
  /*css*/ `
  * {
      font-size: 200%;
    }

    span {
      width: 4rem;
      display: inline-block;
      text-align: center;
    }

    button {
      width: 4rem;
      height: 4rem;
      border: none;
      border-radius: 10px;
      background-color: seagreen;
      color: white;
    }
  `,
])
export class CounterEement extends HTMLElement implements OnChange {
  @observe() count: number = 0;

  constructor(@inject(MathService) private math: MathService) {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const root = this.shadowRoot!;

    root.appendChild(template.content.cloneNode(true));

    root.getElementById('inc')!.addEventListener('click', () => {
      this.count = this.math.increment(this.count);
    });

    root.getElementById('dec')!.addEventListener('click', () => {
      this.count = this.math.decrement(this.count);
    });
  }

  onChange(c: PropChanges) {
    console.log(c);

    this.update();
  }

  private update() {
    const root = this.shadowRoot!;

    root.getElementById('count')!.innerHTML = this.count.toString();
  }
}

customElements.define('hello-world', CounterEement);
