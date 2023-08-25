model Place {
  place_id           :number      ;    
  place_created_at   :Date         ; 
  place_updated_at   :Date         ;  
  place_name         :string  ;          
  place_star_rating  :number;
  place_points       :number;
  place_address      :string ;
  place_latitude     :number;
  place_longitude    :number;
  place_visited_by   :PlaceVisit[];
  place_posts        :Post[];
  place_category_map :MapPlaceCategory[]
}
