import { LitElement, html, css } from 'lit';

export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }
    .prose {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
  `;

  render() {
    return html`
      <div class="prose">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('my-element', MyElement);