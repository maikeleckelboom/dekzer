import VirtualDeck from './VirtualDeck.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('VirtualDeck', () => {
  it('should render', () => {
    const wrapper = mount(VirtualDeck)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
