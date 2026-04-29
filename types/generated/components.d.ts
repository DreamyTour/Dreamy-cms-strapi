import type { Schema, Struct } from '@strapi/strapi';

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'footer';
  };
  attributes: {
    certificaciones: Schema.Attribute.Component<'section.certifications', true>;
    contact: Schema.Attribute.Component<'shared.footer-menu', false>;
    content: Schema.Attribute.Text;
    destination: Schema.Attribute.Component<'shared.footer-menu', false>;
    dreamyAbout: Schema.Attribute.Component<'shared.footer-menu', false>;
    logo: Schema.Attribute.Component<'shared.logo-link', false>;
    socialLogo: Schema.Attribute.Component<'shared.logo-link', true>;
    socialTitle: Schema.Attribute.String;
  };
}

export interface LayoutHeaderTop extends Struct.ComponentSchema {
  collectionName: 'components_layout_header_tops';
  info: {
    displayName: 'header-top';
  };
  attributes: {
    button: Schema.Attribute.Component<'shared.link', true>;
    headerLink: Schema.Attribute.Component<'shared.link', true>;
    logo: Schema.Attribute.Component<'shared.logo-link', false>;
  };
}

export interface LayoutMenu extends Struct.ComponentSchema {
  collectionName: 'components_layout_menus';
  info: {
    displayName: 'menu';
  };
  attributes: {
    menuItems: Schema.Attribute.Component<'shared.menu-item', true>;
  };
}

export interface LayoutTopBar extends Struct.ComponentSchema {
  collectionName: 'components_layout_top_bars';
  info: {
    displayName: 'top-bar';
  };
  attributes: {
    isVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    link: Schema.Attribute.Component<'shared.link', false>;
    text: Schema.Attribute.String;
  };
}

export interface SectionAbout extends Struct.ComponentSchema {
  collectionName: 'components_section_abouts';
  info: {
    displayName: 'about';
  };
  attributes: {
    content: Schema.Attribute.Text;
    imagen: Schema.Attribute.Media<'images'>;
    titulo: Schema.Attribute.String;
  };
}

export interface SectionCertifications extends Struct.ComponentSchema {
  collectionName: 'components_section_certifications';
  info: {
    displayName: 'certifications';
  };
  attributes: {
    premios: Schema.Attribute.Component<'shared.imagen-card', true>;
  };
}

export interface SectionClientGallerie extends Struct.ComponentSchema {
  collectionName: 'components_section_client_galleries';
  info: {
    displayName: 'clientGallery';
  };
  attributes: {
    alt: Schema.Attribute.String;
    imagen: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface SectionHero extends Struct.ComponentSchema {
  collectionName: 'components_section_heroes';
  info: {
    displayName: 'hero';
  };
  attributes: {
    backgroundVideo: Schema.Attribute.Media<'videos'>;
    badgeIcon: Schema.Attribute.Media<'images'>;
    badgeText: Schema.Attribute.String;
    button: Schema.Attribute.Component<'shared.link', true>;
    contenido: Schema.Attribute.Text;
    titulo: Schema.Attribute.String;
  };
}

export interface SectionMachupicchu extends Struct.ComponentSchema {
  collectionName: 'components_section_machupicchus';
  info: {
    displayName: 'sectionCard';
  };
  attributes: {
    category: Schema.Attribute.Relation<'oneToOne', 'api::category.category'>;
    description: Schema.Attribute.Text;
    limit: Schema.Attribute.Integer;
    titulo: Schema.Attribute.String;
  };
}

export interface SectionSectionCardPost extends Struct.ComponentSchema {
  collectionName: 'components_section_section_card_posts';
  info: {
    displayName: 'sectionCardPost';
  };
  attributes: {
    blogs: Schema.Attribute.Relation<'oneToMany', 'api::post.post'>;
    description: Schema.Attribute.Text;
    limit: Schema.Attribute.Integer;
    titulo: Schema.Attribute.String;
  };
}

export interface SharedBadges extends Struct.ComponentSchema {
  collectionName: 'components_shared_badges_s';
  info: {
    displayName: 'badges';
  };
  attributes: {
    content: Schema.Attribute.Text;
    titulo: Schema.Attribute.String;
  };
}

export interface SharedFooterMenu extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_menus';
  info: {
    displayName: 'footerMenu';
  };
  attributes: {
    link: Schema.Attribute.Component<'shared.link', true>;
    titulo: Schema.Attribute.String;
  };
}

export interface SharedImagenCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_imagen_cards';
  info: {
    displayName: 'imagenCard';
  };
  attributes: {
    description: Schema.Attribute.String;
    logo: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'link';
  };
  attributes: {
    badge: Schema.Attribute.String;
    isButton: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<['PRIMARY', 'SECONDARY']>;
    url: Schema.Attribute.String;
  };
}

export interface SharedLogoLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_logo_links';
  info: {
    displayName: 'logo-link';
  };
  attributes: {
    imagen: Schema.Attribute.Media<'images'>;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_menu_items';
  info: {
    displayName: 'menu-item';
  };
  attributes: {
    item: Schema.Attribute.Component<'shared.link', true>;
    link: Schema.Attribute.Component<'shared.link', false>;
  };
}

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_open_graphs';
  info: {
    displayName: 'openGraph';
    icon: 'project-diagram';
  };
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.String;
    ogUrl: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedVideo extends Struct.ComponentSchema {
  collectionName: 'components_shared_videos';
  info: {
    displayName: 'video';
  };
  attributes: {
    thumbnail: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    videoUrl: Schema.Attribute.String;
  };
}

export interface ToursAcordeon extends Struct.ComponentSchema {
  collectionName: 'components_tours_acordeons';
  info: {
    displayName: 'acordeon';
  };
  attributes: {
    contenido: Schema.Attribute.Blocks;
    titulo: Schema.Attribute.String;
  };
}

export interface ToursIncludes extends Struct.ComponentSchema {
  collectionName: 'components_tours_includes';
  info: {
    displayName: 'includes';
  };
  attributes: {
    contenido: Schema.Attribute.Blocks;
    titulo: Schema.Attribute.String;
  };
}

export interface ToursInformation extends Struct.ComponentSchema {
  collectionName: 'components_tours_information';
  info: {
    displayName: 'information';
  };
  attributes: {
    acordeon: Schema.Attribute.Component<'tours.acordeon', true>;
    titulo: Schema.Attribute.String;
  };
}

export interface ToursItinerary extends Struct.ComponentSchema {
  collectionName: 'components_tours_itineraries';
  info: {
    displayName: 'itinerary';
  };
  attributes: {
    acordeon: Schema.Attribute.Component<'tours.acordeon', true>;
    titulo: Schema.Attribute.String;
  };
}

export interface ToursOverview extends Struct.ComponentSchema {
  collectionName: 'components_tours_overviews';
  info: {
    displayName: 'overview';
  };
  attributes: {
    timeline: Schema.Attribute.Component<'tours.timeline', true>;
    titulo: Schema.Attribute.String;
  };
}

export interface ToursPrice extends Struct.ComponentSchema {
  collectionName: 'components_tours_prices';
  info: {
    displayName: 'price';
  };
  attributes: {
    contenido: Schema.Attribute.Blocks;
    titulo: Schema.Attribute.String;
  };
}

export interface ToursTab extends Struct.ComponentSchema {
  collectionName: 'components_tours_tabs';
  info: {
    displayName: 'tab';
  };
  attributes: {
    included: Schema.Attribute.Component<'tours.includes', false>;
    information: Schema.Attribute.Component<'tours.information', false>;
    itinerary: Schema.Attribute.Component<'tours.itinerary', false>;
    overview: Schema.Attribute.Component<'tours.overview', false>;
    price: Schema.Attribute.Component<'tours.price', false>;
  };
}

export interface ToursTimeline extends Struct.ComponentSchema {
  collectionName: 'components_tours_timelines';
  info: {
    displayName: 'timeline';
  };
  attributes: {
    day: Schema.Attribute.String;
    itemsDay: Schema.Attribute.Blocks;
    titulo: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'layout.footer': LayoutFooter;
      'layout.header-top': LayoutHeaderTop;
      'layout.menu': LayoutMenu;
      'layout.top-bar': LayoutTopBar;
      'section.about': SectionAbout;
      'section.certifications': SectionCertifications;
      'section.client-gallerie': SectionClientGallerie;
      'section.hero': SectionHero;
      'section.machupicchu': SectionMachupicchu;
      'section.section-card-post': SectionSectionCardPost;
      'shared.badges': SharedBadges;
      'shared.footer-menu': SharedFooterMenu;
      'shared.imagen-card': SharedImagenCard;
      'shared.link': SharedLink;
      'shared.logo-link': SharedLogoLink;
      'shared.menu-item': SharedMenuItem;
      'shared.open-graph': SharedOpenGraph;
      'shared.seo': SharedSeo;
      'shared.video': SharedVideo;
      'tours.acordeon': ToursAcordeon;
      'tours.includes': ToursIncludes;
      'tours.information': ToursInformation;
      'tours.itinerary': ToursItinerary;
      'tours.overview': ToursOverview;
      'tours.price': ToursPrice;
      'tours.tab': ToursTab;
      'tours.timeline': ToursTimeline;
    }
  }
}
